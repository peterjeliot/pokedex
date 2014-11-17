class ToysController < ApplicationController
  def create
    @pokemon = Pokemon.find(params[:pokemon_id])
    
    if toy = @pokemon.toys.create(toy_params)
      render 'show'
    else
      render json: toy.errors.full_messages, status: 422
    end
  end
  
  def update
    @toy = Toy.find(params[:id])
    
    if @toy.update_attributes(toy_params)
      render 'show'
    else
      render json: @toy.errors.full_messages, status: 422
    end
  end
  
  private
  
  def toy_params
    params.require(:toy).permit(
      :happiness, :name, :price, :image_url, :pokemon_id
    )
  end
  
end