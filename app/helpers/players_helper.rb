module PlayersHelper
  def player_logo(identity)
    if identity.id == 197121
      return 'zeez_90px.png'
    elsif [726024, 128962, 16848, 189676, 289116, 4429, 2811].include?(identity.id)
      return 'hssl_90.png'
    end
    return nil
  end
end
