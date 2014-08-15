class PaymentController < ApplicationController
  include ActiveMerchant::Billing::Integrations

# Here's how payment integration works.
# The Paypal buttons on the ggtracker site include a parameter called 'custom' and put the user id in there.
# After the user signs up for a subscription, Paypal POSTS to us at backend/ipn.
# We set their paypal_profile_id here and turn on their prolevel here.
#
# Later, if they cancel through our settings page, home_controller#cancelled_pro is
# called.  That uses the paypal_profile_id and the Paypal API to
# cancel their subscription.
#
# Or if they cancel on Paypal, we get an IPN notification and process it here.
#
# Smart things we could do someday:
#
# * record the exact date of each subscription and cancellation (some
#   users subscribe and cancel multiple times, so record each one
#   separately).  Then we can have subscription/cancellation analytics
#   to track how product improvements drive performance.
#
# * use this IPN interface to keep track of user payments.  when it's
#   30 days after their last payment, that's when Pro status should
#   turn off.
#

  def paypal_ipn

    # notify = Paypal::Notification.new(request.raw_post)

    if params['txn_type'] == 'subscr_signup'

      user = User.find(params['custom'].to_i)

      ProblemMailer.simple_problem("ggtracker pro IPN activation: #{user.email}", user.email).deliver

      user.paypal_profile_id = params['subscr_id']
      user.paypal_email = params['payer_email']
      user.prolevel = 1
      user.pro_cancelled_at = nil
      user.save!

    elsif params['txn_type'] == 'subscr_cancel'

      users = User.where(:paypal_profile_id => params['subscr_id'])
      if users.size > 0
        user = users.first

        ProblemMailer.simple_problem("ggtracker pro IPN cancellation: #{user.email}", user.email).deliver
        
        user.pro_cancelled_at = Time.now
        user.save!
      end

    elsif params['txn_type'] == 'recurring_payment_suspended_due_to_max_failed_payment'

      users = User.where(:paypal_profile_id => params['recurring_payment_id'])
      if users.size > 0
        user = users.first

        ProblemMailer.simple_problem("ggtracker pro IPN final pay fail: #{user.email}", user.email).deliver
        
        user.prolevel = 0
        user.pro_cancelled_at = Time.now
        user.save!
      end
      
    end

    render :text => ''
  end
end
