class WelcomeMailer < ActionMailer::Base
  default :from => "dsjoerg@ggtracker.com"
 
  def welcome_buddy(user)
    mail(:to => user.email, :subject => "Welcome to GGTracker")
  end
end
