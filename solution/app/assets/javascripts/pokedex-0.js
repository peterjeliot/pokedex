window.Pokedex = (window.Pokedex || {});
window.Pokedex.Models = {};
window.Pokedex.Collections = {};

Pokedex.Models.Pokemon = Backbone.Model.extend({
  urlRoot: '/pokemon',

  // TODO: Write this in Phase 3.
  // create Pokemon Backbone model
  //
  // #toys function - memoize collection with _toys. return _toys
  //   or new Toys collection
  //
  // #parse function - accepts 'jsonResponse' as argument. Take jsonResponse
  //   and check if there is a 'pokemon' key. If so, call #set on our toys collection
  //   with the value of the pokemon key.
  parse: function (payload) {
    if (payload.toys) {
      this.toys().set(payload.toys),
      delete payload.toys;
    }
    return payload;
  },

  toys: function () {
    if (!this._toys) {
      this._toys = new Pokedex.Collections.PokemonToys([], this);
    }
    return this._toys;
  }
});

// TODO: Write this in Phase 3.
Pokedex.Models.Toy = Backbone.Model.extend({
  urlRoot: '/toys'
});

Pokedex.Collections.Pokemon = Backbone.Collection.extend({
  model: Pokedex.Models.Pokemon,
  url: '/pokemon'
});

// TODO: Write this in Phase 3.
Pokedex.Collections.PokemonToys = Backbone.Collection.extend({
  model: Pokedex.Models.Toy,
  initialize: function(models, pokemon) {
    this.pokemon = pokemon;
  }
});

window.Pokedex.Test = {
  testShow: function (id) {
    var pokemon = new Pokedex.Models.Pokemon({ id: id });
    pokemon.fetch({
      success: function () {
        console.log(pokemon.toJSON());
      }
    });
  },

  testIndex: function () {
    var pokemon = new Pokedex.Collections.Pokemon();
    pokemon.fetch({
      success: function () {
        console.log(pokemon.toJSON());
      }
    });
  }
};

window.Pokedex.RootView = function ($el) {
  this.$el = $el;
  this.pokes = new Pokedex.Collections.Pokemon();
  this.$pokeList = this.$el.find('.pokemon-list');
  this.$pokeDetail = this.$el.find('.pokemon-detail');
  this.$newPoke = this.$el.find('.new-pokemon');
  this.$toyDetail = this.$el.find('.toy-detail');

  // Click handlers go here.
  this.$pokeList.on(
    'click', 'li', this.selectPokemonFromList.bind(this)
  );
  this.$newPoke.on(
    'submit', this.submitPokemonForm.bind(this)
  );
  this.$pokeDetail.on(
    'click', 'li', this.selectToyFromList.bind(this)
  );
};

$(function() {
  var $rootEl = $('#pokedex');
	window.Pokedex.rootView = new Pokedex.RootView($rootEl);
  window.Pokedex.rootView.refreshPokemon();
});