namespace :gg do
  desc "Emails DJ about how its going out there."
  task :report => :environment do
    ReportMailer.simple_report.deliver
    ReportMailer.esdb_report.deliver
  end
end
