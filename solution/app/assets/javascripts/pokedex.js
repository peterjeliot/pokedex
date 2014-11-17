// Comments:
// * Pass in an el. OK
// * I removed comparator.
// * Fix weird rendering bug.
// * Definitely add the form. 
// * Each pokemon has many of Xs. When clicking detail view, show all
//   the Xs. Allow them to click for a detail view of the x.
//     * I think this needs: (1) association method, (2) association collection, (3) parse method.
// * **Maybe as a bonus build some wizard for saving nested collection.**

window.Pokedex = function ($el) {
  this.$el = $el; // II
  this.pokes = new Pokedex.Collections.Pokemon; // I

	this.$pokeList = this.$el.find('.pokemon-list'); // II
	this.$pokeDetail = this.$el.find('.pokemon-detail'); // II
  this.$newPoke = this.$el.find('.new-pokemon'); // II
  this.$toyDetail = this.$el.find('.toy-detail'); // III

	this.$pokeList.on('click', 'li', this.selectPokemonFromList.bind(this)); // II
  this.$newPoke.on('submit', this.submitPokemonForm.bind(this)); // II
  this.$pokeDetail.on('click', 'li', this.selectToyFromList.bind(this)); // III

  this.pokemonListItemTemplate = _.template($('#template-pokemon-list-item').html());
  this.pokemonDetailTemplate = _.template($('#template-pokemon-detail').html());
  this.toyListItemTemplate = _.template($('#template-toy-list-item').html());
  this.toyDetailTemplate = _.template($('#template-toy-detail').html());

  this.pokes.on('change', this.addAllPokemonToList.bind(this)); 
}

Pokedex.Models = {}; // I
Pokedex.Collections = {}; // I

// create Pokemon Backbone model
//
// #toys function - memoize collection with _toys. return _toys
//   or new Toys collection
//
// #parse function - accepts 'jsonResponse' as argument. Take jsonResponse
//   and check if there is a 'pokemon' key. If so, call #set on our toys collection
//   with the value of the pokemon key. 
Pokedex.Models.Pokemon = Backbone.Model.extend({ // I
	urlRoot: '/pokemon', // I

  parse: function(payload) { // III
    if(payload.toys) {
      this.toys().set(payload.toys),
      delete payload.toys;
    } 
    return payload;
  },

  toys: function() { // III
    if(!this._toys) {
      this._toys = new Pokedex.Collections.Toys([], this);
    }
    return this._toys;
  }
});

// create Pokemon Backbone collection
Pokedex.Collections.Pokemon = Backbone.Collection.extend({
  model: Pokedex.Models.Pokemon, // I
	url: '/pokemon', // I
  comparator: 'number', // bonus?
});

Pokedex.Models.Toy = Backbone.Model.extend({ // III 
});

Pokedex.Collections.Toys = Backbone.Collection.extend({ // III 
  model: Pokedex.Models.Toy,
  initialize: function(models, pokemon) {
    this.pokemon = pokemon;
  },
  
  url: function () {
    return this.pokemon.url() + '/toys'
  }
});

Pokedex.prototype.createPokemon = function (attrs, callback) { // I
	// instantiate object
	// set attributes
	// save and call callback
	var poke = new Pokedex.Models.Pokemon(attrs);

  // Have an alert pop-up which confirms saving when that is complete.
  // Don't add the new pokemon until it is saved properly.
	var that = this;
  poke.save(attrs, {
    success: function() {
      that.pokes.add(poke)
      callback && callback.call(this, poke);
    }
  });

  return poke;
};

Pokedex.prototype.createToy = function (attrs, callback) { // III
  var pokeId = attrs.pokemon_id;
  var pokemon = this.pokes.get(pokeId);
  
  var toy = pokemon.toys().create(attrs, {
    success: function () {
      callback && callback(toy);
    }
  });
};

Pokedex.prototype.listPokemon = function (callback) { // I
	// fetch collection
	// print names asynch
  this.pokes.fetch({
  	success: (function () {
  		this.pokes.each(this.addPokemonToList.bind(this));
      callback && callback();
  	}).bind(this)
  });
  return this.pokes;
};

Pokedex.prototype.renderPokemonDetail = function (pokemon) { // II
  // fetch pokemon on renderPokemonDetail - this calls the show action on 
  // pokemon controller and delivers @pokemon.toys through jbuilder
  // on success, render toys and append to $pokeDetail
  this.$pokeDetail.empty();
  this.$toyDetail.empty();
  var that = this;

  pokemon.fetch({ // III
    success: function() {
      pokemon.toys().each(function(toy) { // III
        that.renderToyListItem(toy);
      });
    }
  });

  var renderedContent = this.pokemonDetailTemplate({ // IV
    pokemon: pokemon
  });

	this.$pokeDetail.html(renderedContent);
  this.$pokeDetail.find('.create-toy').on('submit', 
        this.submitToyForm.bind(this)); // IV
  this.$pokeDetail.find('.edit-pokemon').on('submit', 
        this.updatePokemon.bind(this, pokemon));
};

Pokedex.prototype.addPokemonToList = function (pokemon) { // II 
	// build LI
	// apped it to $pokeList
  var renderedContent = this.pokemonListItemTemplate({
    pokemon: pokemon
  });
  
	this.$pokeList.append(renderedContent);
};

Pokedex.prototype.addAllPokemonToList = function () {
  this.$pokeList.empty();
  var that = this;
  this.pokes.each(function(poke) {
    that.addPokemonToList(poke);
  });
};

Pokedex.prototype.renderToyDetail = function(toy) { // III
  this.$toyDetail.empty();

  var renderedContent = this.toyDetailTemplate({ // IV
    toy: toy
  });
  
  this.$toyDetail.html(renderedContent);
};

Pokedex.prototype.renderToyListItem = function (toy) { // III
  var $list = this.$pokeDetail.find('.toys');
  var renderedContent = this.toyListItemTemplate({ // IV
    toy: toy
  });
  
  $list.append(renderedContent);
};

Pokedex.prototype.selectPokemonFromList = function (event) { // II
  var $target = $(event.target);

	var pokeId = $target.data('id');
	var pokemon = this.pokes.get(pokeId);

	this.renderPokemonDetail(pokemon);
};

Pokedex.prototype.selectToyFromList = function (event) { // III
  var $target = $(event.target);

	var toyId = $target.data('id');
  var pokemonId = $target.data('pokemon-id');

	var pokemon = this.pokes.get(pokemonId);
  var toy = pokemon.toys().get(toyId);

  this.renderToyDetail(toy);
};

Pokedex.prototype.submitPokemonForm = function (event) { // II
  event.preventDefault();
  var pokeAttrs = $(event.target).serializeJSON()['pokemon'];

  var that = this;
  this.createPokemon(pokeAttrs, function (pokemon) {
    that.renderPokemonDetail(pokemon);
    that.addPokemonToList(pokemon);
  });
};

Pokedex.prototype.submitToyForm = function (event) {
  event.preventDefault();
  var toyAttrs = $(event.target).serializeJSON()['toy'];

  var that = this;
  this.createToy(toyAttrs, function (toy) {
    that.renderToyDetail(toy);
    that.renderToyListItem(toy);
  });
};

Pokedex.prototype.updatePokemon = function (pokemon, event) {
  event.preventDefault();
  var pokeAttrs = $(event.target).serializeJSON()['pokemon'];
  
  var that = this;
  pokemon.save(pokeAttrs, {
    success: function () {
      that.renderPokemonDetail(pokemon);
    }
  })
};

$(function() {
  var $rootEl = $('#pokedex');

	var pokedex = new Pokedex($rootEl);
  pokedex.listPokemon();
});
