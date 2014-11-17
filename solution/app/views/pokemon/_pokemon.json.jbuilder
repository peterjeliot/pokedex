json.extract!(pokemon, :id, :name, :poke_type, :attack,
			:defense, :moves, :image_url)

toys ||= nil
unless toys.nil?
  json.toys(toys) do |toy| 
    json.partial! 'toys/toy', toy: toy
  end
end
