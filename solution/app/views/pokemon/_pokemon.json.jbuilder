json.extract!(
	pokemon,
	:id, :attack, :defense, :image_url, :moves, :name, :poke_type
)

toys ||= nil
unless toys.nil?
  json.toys do
		json.array!(toys) { |toy| json.partial! 'toys/toy', toy: toy }
	end
end
