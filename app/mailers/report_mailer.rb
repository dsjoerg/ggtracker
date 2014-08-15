class ReportMailer < ActionMailer::Base
  default :from => "dsjoerg@ggtracker.com"
 
  def simple_report()
    mail(:to => 'dsjoerg@ggtracker.com', :subject => "User report for #{Date.today()}")
  end

  def esdb_report()
    mail(:to => 'dsjoerg@ggtracker.com', :subject => "ESDB report for #{Date.today()}")
  end
end
