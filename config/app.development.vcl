# Shortened/modified version of: https://gist.github.com/3305056
# TODO: eventually bring back grace/health checks, they might be useful.
#
# FIXME: we had to downgrade to 2.1.3 on EY, so this VCL will no longer work 
# without small modifications. Running 3.0.x locally though, so I'll leave
# it here for now.


# https://www.varnish-cache.org/docs/3.0/tutorial/vcl.html
# https://www.varnish-cache.org/trac/wiki/VCLExamples

# For debugging proporses
# import std;
# std.log("log something");

backend default {
  .host = "127.0.0.1";
  .port = "3000";
}

# NOTE: vcl_recv is called at the beginning of a request, after the complete
# request has been received and parsed. Its purpose is to decide whether or not
# to serve the request, how to do it, and, if applicable, which backend to use.
sub vcl_recv {
  # if the cctrl cookie is set, pass right away.
  if(req.http.Cookie ~ "cctrl=") {
    return(pass);
  }
  
  # If the request url contains "users", (e.g. users/sign_out), pass.
  if(req.url ~ "users") {
    return (pass);
  }

  # Normalize Accept-Encoding to prevent duplicates in the cache
  # https://www.varnish-cache.org/trac/wiki/VCLExampleNormalizeAcceptEncoding
  if (req.http.Accept-Encoding) {
    if (req.http.Accept-Encoding ~ "gzip") {
      set req.http.Accept-Encoding = "gzip";
    } elsif (req.http.Accept-Encoding ~ "deflate") {
      set req.http.Accept-Encoding = "deflate";
    } else {
      # unkown algorithm
      remove req.http.Accept-Encoding;
    }
  }

  # This rule is to insert the client's ip address into the request header
  if (req.restarts == 0) {
    if (req.http.x-forwarded-for) {
      set req.http.X-Forwarded-For = req.http.X-Forwarded-For + client.ip;
    } else {
      set req.http.X-Forwarded-For = client.ip;
    }
  }

  # Don't cache POST, PUT, or DELETE requests
  if (req.request == "POST" || req.request == "PUT" || req.request == "DELETE") {
    return(pass);
  }

  # Strip cookies from static content
  if (req.request == "GET" && req.url ~ "\.(png|gif|jpg|swf|css|js)$") {
    unset req.http.cookie;
  }

  return(lookup);
}

sub vcl_pipe {
  # Note that only the first request to the backend will have
  # X-Forwarded-For set.  If you use X-Forwarded-For and want to
  # have it set for all requests, make sure to have:
  # set bereq.http.connection = "close";
  # here.  It is not set by default as it might break some broken web
  # applications, like IIS with NTLM authentication.
  set bereq.http.connection = "close";
  return(pipe);
}

# NOTE: vcl_fetch is called after a document has been successfully retrieved
# from the backend. Normal tasks her are to alter the response headers, trigger
# ESI processing, try alternate backend servers in case the request failed.
sub vcl_fetch {
  # If header specifies "max-age", remove any cookie and deliver into the cache.
  # The idea here is to trust the backend. If the backend set a max-age in
  # the Cache-Control header, then the response should be cached even if there
  # is a Set-Cookie header. The cleaner way to handle this is the not set a
  # Set-Cookie header in the backend, but unfortunately Rails always sets one.
  if (beresp.http.Cache-Control ~ "max-age") {
     unset beresp.http.Set-Cookie;

     # We shall cache. You shan't.
     set beresp.http.nobrowsercache = "1";

     return(deliver);
  }

  # Do not deliver into cache otherwise.
  return(hit_for_pass);
}

sub vcl_deliver {
  # The below provides custom headers to indicate whether the response came from
  # varnish cache or directly from the app.
  if (obj.hits > 0) {
    set resp.http.X-Varnish-Cache = "HIT";
  } else {
    set resp.http.X-Varnish-Cache = "MISS";
  }

  # We don't want any proxy or browser to cache. Why?
  # Once the browser has cached, he won't care if a user has logged out or not
  # and we can't tell him to invalidate all cache on our domain.
  # (Or can we?)
  if (resp.http.nobrowsercache) {
    unset resp.http.nobrowsercache;
    set resp.http.Cache-Control = "max-age=0, private, must-revalidate";
  }
}