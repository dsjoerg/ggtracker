class MatchnotesController < ApplicationController
  before_filter :authenticate_user!
  respond_to :json
  def get_for_match
    @matchnote = current_user.matchnotes.find_by_match_id(params[:match_id])
    respond_with @matchnote
  end

  def post_for_match
    @matchnote = current_user.matchnotes.find_by_match_id(params[:match_id])
    if @matchnote
      @matchnote.note = params[:note]
    else
      @matchnote = Matchnote.new(
                     user: current_user,
                     note: params[:note],
                     match_id: params[:match_id]
                   )
    end      
    @matchnote.save!

    respond_with @matchnote
  end
end
