module MetaHelper
  def meta_tag(field)
    # If it's a property, set property instead (opengraph namespace)
    att = field =~ /(og:|ggtr)/ ? 'property' : 'name'
    %(<meta #{att}="#{h(field)}" content="#{h(meta(field))}"/>)
  end

  def meta(field = nil, list = [])
    @meta ||= {
      'title' => [],
    }

    if field.is_a?(Hash)
      @meta = @meta.merge(field)
      return
    end

    field = field.to_s

    if !field.blank?
      @meta[field] ||= []
      case list.class.to_s
        when 'Array' then
          @meta[field] = [@meta[field]] if !@meta[field].is_a?(Array)
          @meta[field] += list
        when 'String' then
          @meta[field] += [list]
        else
          @meta[field] += [list]
      end

      case field
        when 'description' then
          content = truncate(strip_tags(h(@meta[field].join(', '))), :length => 255)
        when 'title' then
          _parts = @meta[field].is_a?(Array) ? @meta[field] : [@meta[field]]
          # _parts << 'GGTracker'
          _parts.reject!{|p|p.nil? || p.blank?}
          content = _parts.uniq.join(' | ')
        else
          content = @meta[field].join(',')
      end

      return content
    else
      # see if we have an object and set meta fields automatically
      @object ||= @match || @identity

      if @object
        meta({
          'title'    => @object.respond_to?(:caption) ? @object.caption : "#{@object.class.to_s} #{@object.id}",

          # facebook prefers description over their og:description, beware.
          'description' => @object.description
        })
        
        if @object.is_a?(ESDB::Match)
          meta({
            'og:description'  => truncate(@object.description, :length => 150),
            'og:title'        => @object.caption,
            'og:image'        => "http://s3.amazonaws.com/#{Rails.configuration.s3['minimaps']['bucket']}/#{@object.map["s2ma_hash"]}_100.png",
            'og:url'          => "http://#{request.host_with_port}/matches/#{@object.id}",
            'og:type'         => 'ggtracker:match'
          })
        end

        if @object.is_a?(ESDB::Identity)
          meta({
            'og:description'  => truncate(@object.description, :length => 150),
            'og:title'        => @object.caption,
            # Would love to pass the portrait in here, but it's a spritemap!
            # 'og:image'        => "",
            'og:url'          => "http://#{request.host_with_port}/players/#{@object.id}/#{@object.name}",
            'og:type'         => 'ggtracker:player'
          })
        end

      # No Object present - check for controllers via ApplicationHelper#active?
      else
        if active?(:matches)
          meta({
            'title' => 'Starcraft II Matches',
            'description' => 'The latest Starcraft replays, with stats and charts galore'
          })
        elsif active?(:players)
          meta({
            'title' => 'Starcraft II Players',
            'description' => 'Hundreds of thousands of Starcraft players and replays, with stats and charts galore'
          })
        else
          return nil
        end
      end

      tags = ''
      @meta.each do |field, list|
        tags += meta_tag(field)+"\n"
      end
      return raw(tags.rstrip)
    end
  end
end
