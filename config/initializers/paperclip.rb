require 'paperclip/media_type_spoof_detector'
module Paperclip
  class MediaTypeSpoofDetector
    def spoofed?
      false
    end
  end
end


# Paperclip interpolations, used in filenames/paths
# Note: for initializers, reload! will not suffice, restart server/console

# Content based MD5 hash
Paperclip.interpolates :content_hash do |attachment, style|
  # Has the hash already been written?
  if attachment.instance.md5.present?
    attachment.instance.md5

  # Or are we currently uploading?
  elsif attachment.queued_for_write[:original]
    hash = Digest::MD5.hexdigest(attachment.queued_for_write[:original].read)
    attachment.instance.update_attribute(:md5, hash)
    hash

  # Or did something go horribly wrong?
  else
    'failure'
  end
end
