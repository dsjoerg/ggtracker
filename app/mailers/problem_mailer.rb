class ProblemMailer < ActionMailer::Base
  default :from => "dsjoerg@ggtracker.com"
 
  def simple_problem(subject, problem)
    @problem = problem
    mail(:to => 'dsjoerg@ggtracker.com', :subject => subject)
  end
end
