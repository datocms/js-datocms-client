# frozen_string_literal: true
require 'erb'
require 'active_support/core_ext/string/inflections'
require 'active_support/core_ext/string/indent'

require_relative './build_method'

class BuildRepo
  attr_reader :resource, :schema, :namespace

  def initialize(namespace, resource, schema)
    @namespace = namespace
    @resource = resource
    @schema = schema
  end

  def build
    File.open("./src/#{namespace}/repos/#{resource.classify}Repo.js", 'w') do |file|
      file.write content
    end
  end

  def content
    ERB.new(template, nil, '-').result(binding)
  end

  def template
    File.read('./build/templates/repo.rb.erb')
  end

  def class_name
    resource.classify
  end

  def methods
    schema.links.map do |link|
      BuildMethod.new(resource, link)
    end
  end

  def links
    schema.links
  end
end
