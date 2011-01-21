require 'less'

module Jekyll
  class Less < Converter
    safe true
    priority :low
    
    def matches(ext)
      ext =~ /less/i
    end 
    
    def output_ext(ext)
      ".css"
    end
    
    def convert(content)
      ::Less.parse content
    end
  end
end
