class HomeController < ApplicationController
  def home_lander
    if rand > 0.001
      redirect_to "/landing_tour"
    else
      redirect_to "/landing_home"
    end
  end

  def pro_lander
    redirect_to "/you_are_pro"
    current_user.prolevel = 1
    current_user.save!
    ProblemMailer.simple_problem("ggtracker pro activation: #{current_user.email}", current_user.email).deliver
  end

  def cancelled_pro
    current_user.pro_cancelled_at = Time.now
    current_user.save!
    if current_user.paypal_profile_id.present?
      paypal_response = GATEWAY.cancel_recurring(current_user.paypal_profile_id)
      success_code = paypal_response.params['ack']
      full_details = paypal_response.params
    else
      success_code = 'No Paypal Profile ID, gotta do it manually'
      full_details = 'N/A'
    end

    email_body = """
paypal cancellation result: #{success_code}<br><br>
email: #{current_user.email}<br><br>
paypal email: #{current_user.paypal_email}<br><br>
paypal profile id: #{current_user.paypal_profile_id}<br><br>
paypal cancellation result details: #{full_details}<br><br>
"""

    ProblemMailer.simple_problem("ggtracker pro cancellation: #{current_user.email}", email_body).deliver
  end

  def hiring
    if params[:ref].present?
      recruiter_id = params[:ref]
      Resque.redis.sadd("hiring:ips:#{recruiter_id}", "#{request.remote_ip}")
      num_recruits = Resque.redis.scard("hiring:ips:#{recruiter_id}")
      Resque.redis.zadd('recruiters', num_recruits.to_i, "#{recruiter_id}")
    end
  end

  def get_leaderboard

    leaders = []
    raw_leaders = Resque.redis.zrevrange('recruiters', 0, -1, :with_scores => true)
    raw_leaders.each do |leader|
      theuser = User.find_by_id(leader[0])
      if theuser.present?
        leaders << {:name => theuser.name_for_public,
          :primary_account => theuser.primary_account,
          :score => leader[1]}
      end
    end
    
    leaders
  end

  def hiring_leaderboard
    if $leaders.nil? || (Time.now - $leaders_age > 60)
      $leaders = get_leaderboard
      $leaders_age = Time.now
    end

    @recruiting_url = "http://ggtracker.com/hiring"
    if signed_in?
      @recruiting_url = "http://ggtracker.com/hiring?ref=#{current_user.id}"
    end
  end
end
