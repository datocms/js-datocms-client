# frozen_string_literal: true
require 'json'
require 'json_schema'
require_relative './build_repo'

class BuildClient
  attr_reader :schema, :namespace, :blacklisted_resources

  def initialize(schema, namespace, blacklisted_resources)
    @namespace = namespace
    @blacklisted_resources = blacklisted_resources
    @schema = JsonSchema.parse!(JSON.parse(schema))
    @schema.expand_references!
  end

  def build
    schema.properties.each do |resource, resource_schema|
      next unless !blacklisted_resources.include?(resource) &&
                  resource_schema.links.any?

      blacklisted_rels = blacklisted_resources
                         .select { |x| x =~ /^#{resource}#.*$/ }
                         .map { |x| x.gsub(/^#{resource}#/, '') }

      BuildRepo.new(
        namespace,
        resource,
        resource_schema,
        blacklisted_rels
      ).build
    end
  end
end
