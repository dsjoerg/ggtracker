class StaticController < ApplicationController
  def blitz
    render :text => "42"
  end

  def five_hundred
    1/0
    render :text => "not 500", :status => 500
  end

  def addineyeV2
    render "addineyeV2.html", :layout => false
  end
end
