var HOSTNAME = 'blog.hunch.se'
var DST_DIR = '/Users/rasmus/blog/_posts'
var POST_LAYOUT = 'post'
var DRY_RUN = false
var URL_MAP_PATH = '/Users/rasmus/blog/tumblr-urls.json'
var TAGS_FILTER = function (tag) { return true; }
var TAGS_MAPPER = function (tag) { return tag.toLowerCase(); }

var CUSTOM_FRONT_MATTER = function (post) {
  return {
    tumblr_id:  post.id,
    date:       post['date-gmt'].replace(/ GMT$/, ' UTC')
  }
}

var TITLE = function (post, suggested_title) {
  return suggested_title;
}

var BODY = function (post) {
  switch (post.type) {

    case 'regular':
      return post['regular-body']

    case 'photo':
      var url = post['photo-url-1280'];
      if (url.indexOf('http://'+HOSTNAME) === 0) {
        // the image is hosted on Tumblr and need to be downloaded or post
        // skipped since hotlinking is not allowed. To skip the post, simply
        // return any false value.
        // Since I have very few "photo" posts I just log a message and manage
        // this manually later
        console.log('PHOTO: %s NEED FIXING %s', post.filename, url)
      }
      var body = '!['+post['photo-caption']+']('+url+')'
      var link_url = post['photo-link-url']
      if (link_url && link_url.length)
        body = '['+body+']('+link_url+')'
      return body

  }
}

// for (tumblr -> jekyll) redirects
var url_map = {};

// called when a post is about to be written. Can be used to modify some
// properties of the post or just simply log a message. Return a false value to
// skip the post.
var WRITE_POST = function (post, dst_path, contents_to_be_written) {
  if (url_map)
    url_map[post.url] = post.filename
  //console.log(url_map)
  return true
}


// ----------------------------------------------------------------------------
// The machine follows

var http = require('http'), fs = require('fs')
var tumblr = http.createClient(80, HOSTNAME)

function G(f) {
  if (typeof f === 'function')
    return f.apply(this, Array.prototype.slice.call(arguments, 1))
  return f;
}

var retry_delay_initial = 5000;
var retry_delay_max = 300000; // 5 min
var retry_delay = 0;

function import_posts(offset, final_callback) {
  if (typeof offset === 'function') {
    final_callback = offset;
    offset = 0;
  }
  
  var args = Array.prototype.slice.call(arguments)
  var callee = arguments.callee
  var self = this;
  
  var path = '/api/read/json?num=50&filter=none&start='+(offset || '0')
  console.error('Requesting %s', path)
  var request = tumblr.request('GET', path, {'host': HOSTNAME})
  request.end();
  request.on('response', function (response) {
    var response_body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) { response_body += chunk })
    response.on('end', function () {
      // todo: should probably check response.statusCode here
      var status_class = String(response.statusCode)[0]
      if (status_class === '4') {
        var msg = 'HTTP '+response.statusCode+' response';
        if (final_callback) {
          var err = new Error(msg);
          response.body = response_body;
          err.response = response;
          final_callback(err);
        } else {
          console.error('ERROR: ' + msg + '\n' + response_body);
        }
        return;
      } else if (status_class !== '2' || !response_body ||
                 response_body.length === 0 ||
                 response_body.trimRight().substr(-2) !== '};') {
        retry_delay = Math.min(retry_delay ? retry_delay * 1.6
                                           : retry_delay_initial,
                               retry_delay_max);
        console.error('Tumblr fail (HTTP %d) -- retrying in %d seconds...',
                      response.statusCode, Math.round(retry_delay/1000.0))
        setTimeout(function() { callee.apply(self, args) }, retry_delay);
        return;
      }
      retry_delay = 0;
      response_body = response_body.replace(/^var tumblr_api_read = /g, '');
      response_body = response_body.replace(/[^}]+$/g, '');
      var s = JSON.parse(response_body);
      var num_posts = s.posts.length
      var next_offset = parseInt(s['posts-start']) + num_posts
      if (next_offset > parseInt(s['posts-total']))
        next_offset = 0;
      //console.log(next_offset)
      //console.log(s)
      s.posts.forEach(function (post) {
        var fnext = post.format == 'markdown' ? '.md' : '.html'
        var filename = post['date-gmt'].split(' ')[0] + '-' + post.slug + fnext;
        post.filename = filename;
        var body = '---';
        var layout = G(POST_LAYOUT, post);
        post.layout = layout;
        if (layout) body += '\nlayout: '+layout;
        var title = TITLE(post, post['regular-title'] || post['photo-caption']);
        post.title = title;
        if (Array.isArray(post.tags) && post.tags.length) {
          post.tags = post.tags.filter(TAGS_FILTER).map(TAGS_MAPPER);
          if (post.tags.length) {
            var o = {};
            for (var i=0;i<post.tags.length;++i) o[post.tags[i]] = true;
            post.tags = Object.keys(o)
            if (post.tags.length === 1)
              body += '\ncategory: '+post.tags[0];
            else
              body += '\ncategories: ['+post.tags.join(', ')+']';
          }
        }
        var additional_fields = CUSTOM_FRONT_MATTER(post)
        if (typeof additional_fields === 'object') {
          Object.keys(additional_fields).forEach(function(k) {
            body += '\n'+k+': '+additional_fields[k]
          })
        }
        var post_body = BODY(post);
        if (post_body) {
          if (post.title) body += '\ntitle: '+post.title;
          body += '\n---\n\n' + post_body;
          //console.log('%s -> %s', post['date-gmt'], filename)
          //console.log(body)
          var dst_path = G(DST_DIR, post) + '/' + filename
          if (!WRITE_POST || WRITE_POST(post, dst_path, body)) {
            try {
              console.log('Writing [%s] "%s" --> %s', post['date-gmt'], title,
                          dst_path)
              if (!DRY_RUN)
                fs.writeFileSync(dst_path, body, 'utf8')
            } catch (e) {
              if (final_callback) final_callback(e)
              else throw e;
            }
          }
        };
      });

      // schedule next
      if (next_offset > 0 && !DRY_RUN) {
        console.log('import_posts(next_offset, final_callback);')
        import_posts(next_offset, final_callback);
      } else if (final_callback) {
        final_callback();
      }
    })
  })
}

if (require.main == module) {
  import_posts(function (err) {
    if (err) return console.error(err);
    if (url_map)
      fs.writeFileSync(URL_MAP_PATH, JSON.stringify(url_map), 'utf8');
    console.log('Done.')
  });
}
