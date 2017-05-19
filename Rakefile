# frozen_string_literal: true
require 'open-uri'
require_relative './build/build_client'

desc 'Regenerates the client starting from the JSON Hyperschema'
task :regenerate do
  BuildClient.new(
    open('https://site-api.datocms.com/docs/site-api-hyperschema.json').read,
    'site',
    %w(session item user#update search_result)
  ).build

  BuildClient.new(
    open('https://account-api.datocms.com/docs/account-api-hyperschema.json').read,
    'account',
    %w(session account#create account#reset_password subscription portal_session)
  ).build
end
