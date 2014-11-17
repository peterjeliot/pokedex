Rails.application.routes.draw do
  root to: 'static_pages#root'

  resources(
    :pokemon,
    defaults: {format: :json},
    only: [:create, :show, :index, :destroy, :update]
  ) { resources :toys, only: [:create, :update] }
end
