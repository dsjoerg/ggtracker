
# http://six-impossible.blogspot.com/2011/05/significant-digits-in-ruby-float.html

  class Float
    def sigfig_to_s(digits)
      f = sprintf("%.#{digits - 1}e", self).to_f
      i = f.to_i
      (i == f ? i : f).to_s
    end
  end
