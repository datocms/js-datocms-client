require 'json'

class BuildMethod
  IDENTITY_REGEXP = /\{\(.*?definitions%2F(.*?)%2Fdefinitions%2Fidentity\)}/

  REL_TO_METHOD = {
    instances: :all,
    self: :find
  }.freeze

  attr_reader :link, :resource

  def initialize(resource, link)
    @link = link
    @resource = resource
  end

  def method_body
    ERB.new(template, nil, '-').result(binding)
  end

  def request_method
    link.method
  end

  def request_url
    url = link.href.gsub IDENTITY_REGEXP do
      "\${#{Regexp.last_match(1).camelize(:lower)}Id}"
    end
    url_arguments.any? ? "`#{url}`" : "'#{url}'"
  end

  def method_signature
    arguments = url_arguments

    if schema?
      arguments << if get_request?
                     'query'
                   else
                     'resourceAttributes'
                   end
    end

    arguments.join(', ')
  end

  def request_argument
    if schema?
      if get_request?
        ', query'
      else
        ', body'
      end
    else
      ''
    end
  end

  def url_arguments
    result = []
    link.href.scan IDENTITY_REGEXP do |_placeholder|
      result << "#{Regexp.last_match(1).camelize(:lower)}Id"
    end
    result
  end

  def attributes
    if schema_attributes
      schema_attributes.properties.keys
    else
      []
    end
  end

  def required_attributes
    if schema_attributes
      schema_attributes.required || []
    else
      []
    end
  end

  def relationships
    return {} unless schema_relationships
    result = {}

      schema_relationships.properties.map do |relationship, schema|
        is_collection = schema.properties['data'].type.first == 'array'

        definition = if is_collection
                       schema.properties['data'].items
                     elsif schema.properties['data'].type.first == 'object'
                       schema.properties['data']
                     else
                       schema.properties['data'].any_of.find do |option|
                         option.type.first == 'object'
                       end
                     end

        type = definition.properties['type']
               .pattern.source.gsub(/(^\^|\$$)/, '')

        result[relationship.to_sym] = type
      end
    return result
  end

  def required_relationships
    if schema_relationships
      schema_relationships.required || []
    else
      []
    end
  end

  def schema_relationships
    schema? && link.schema.properties['data'].properties['relationships']
  end

  def schema_attributes
    schema? && link.schema.properties['data'].properties['attributes']
  end

  # rubocop:disable Style/AccessorMethodName
  def get_request?
    request_method == :get
  end
  # rubocop:enable Style/AccessorMethodName

  def put_request?
    request_method == :put
  end

  def schema?
    link.schema
  end

  def name
    if REL_TO_METHOD.key?(link.rel.to_sym)
      REL_TO_METHOD[link.rel.to_sym]
    else
      link.rel.camelize(:lower)
    end
  end

  def template
    File.read('./build/templates/method.rb.erb')
  end

  def serialization_rules
    buf = ""
    buf << "{\n"
    buf << "  type: '#{resource}',\n"

    if attributes.any?
      buf << "  attributes: [\n"
      attributes.each do |attr|
        buf << "    '#{attr.to_s.camelize(:lower)}',\n"
      end
      buf << "  ],\n"
    end

    if required_attributes.any?
      buf << "  requiredAttributes: [\n"
      attributes.each do |attr|
        buf << "    '#{attr.to_s.camelize(:lower)}',\n"
      end
      buf << "  ],\n"
    end

    unless relationships.empty?
      buf << "  relationships: {\n"
      relationships.each do |key, value|
        buf << "    #{key.to_s.camelize(:lower)}: '#{value}',\n"
      end
      buf << "  },\n"
    end

    unless required_relationships.empty?
      buf << "  requiredRelationships: [\n"
      required_relationships.each do |attr|
        buf << "    '#{attr.to_s.camelize(:lower)}',\n"
      end
      buf << "  ],\n"
    end

    buf << "}"

    buf.gsub(/"/, "'").gsub(/\n/, "\n" + "  " * 3)
  end
end
