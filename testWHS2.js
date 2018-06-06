//https://jsfiddle.net/Aaronksaunders/pvs7qg4q/

//var photos = '[{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg", width: 574, height: 381 },]';
var photos = [];
var numList = 1;
var lastInd = 0;

// A react component for a tag
class Tag extends React.Component {

	constructor (props) {
		super(props);
		this.onClickFunc = this.onClickFunc.bind(this);
	}

	onClickFunc () {
		this.props.functionCall(this.props.text);
	}

render () {

	return React.createElement('div', [], React.createElement('p',
		    {className: 'tagText',
		    onClick: this.onClickFunc},
		   this.props.text));
	};
};


// A react component for controls on an image tile
class TileControl extends React.Component {

	constructor (props) {
		super(props);
		var tagsSplit = this.props.tags.split(",");
		//console.log("tagsSplit: ", tagsSplit);
		this.state = {tagsSplit: tagsSplit};
		this.changeTagSplit = this.changeTagSplit.bind(this);
	}

	updateState(temp){
		this.setState ({tagsSplit: temp});
	}

	changeTagSplit (tagToRemove) {

		//console.log("OLD ARRAY IS: ",this.state.tagsSplit);

		var _temp = this.state.tagsSplit;
		//console.log("temp: ", _temp);
		//console.log("type: ", typeof(_temp));
		console.log("tagToRemove: ", tagToRemove);
		var indexOfTag = _temp.indexOf(tagToRemove);
		_temp.splice(indexOfTag, 1);

		this.setState ({tagsSplit: _temp});

		//console.log("NEW ARRAY IS: ",this.state.tagsSplit);

		var stringifyArr = JSON.stringify(_temp);
		//console.log("string ar: ", stringifyArr);
		var fixedArr = stringifyArr.substr(1,stringifyArr.length-2);
		while(fixedArr.indexOf('"') != -1) {
			fixedArr = fixedArr.replace('"',"");
		}

		console.log("NEW VALUE OF STR IS: ",fixedArr);

		var oReq = new XMLHttpRequest(); 
		var fullSrc = this.props.src;
		var easySrc = fullSrc.substr(fullSrc.indexOf("UNESCO")+7);
		//console.log("this is easy source: ", easySrc);
		var url = "query?source="+ easySrc + "updateTags=" + fixedArr;
		oReq.open("GET", url);
		//console.log("url: ", url);

		this.props.reload();

	}

    render () {
	// remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
        var _tags = this.state.tagsSplit;
		var tagsSplit = _tags;

		var args = [];
		args.push( 'div' );
		args.push( { className: _selected ? 'selectedControls' : 'normalControls'} )
			for (let idx = 0; idx < tagsSplit.length; idx++)
				args.push( React.createElement(Tag, {text: tagsSplit[idx], source: _src, tags: _tags, functionCall: this.changeTagSplit} ) ); //pass in the function to update/ajax req to tag , tagOnClick(tagsSplit[idx], _src)
			return ( React.createElement.apply(null, args) 
				);

    } // render
};


// A react component for an image tile
class ImageTile extends React.Component {

	reload(){
		console.log("RELOADING");
		//this.forceUpdate();
	}

    render() {
	// onClick function needs to remember these as a closure
	var _onClick = this.props.onClick;
	var _index = this.props.index;
	var _photo = this.props.photo;
	var _tags = _photo.tags;
	var _selected = _photo.selected; // this one is just for readability

	return (
	    React.createElement('div', 
	        {style: {margin: this.props.margin, width: _photo.width},
			 className: 'tile',
                         onClick: function onClick(e) {
			    console.log("tile onclick");
			    // call Gallery's onclick
			    return _onClick (e, 
					     { index: _index, photo: _photo }) 
				}
		 }, // end of props of div
		 // contents of div - the Controls and an Image
		React.createElement(TileControl,
		    {selected: _selected, 
		    	tags: _tags,
		    	reload: this.reload,
		     src: _photo.src}),
		React.createElement('img',
		    {className: _selected ? 'selected' : 'normal', 
                     src: _photo.src, 
		     width: _photo.width, 
                     height: _photo.height
			    })
				)//createElement div
	); // return
    } // render
} // class


// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: photos, columns: 2 };
    this.selectTile = this.selectTile.bind(this);
  }


  selectTile(event, obj) {
    //console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
  }

  render() {
    return (
       React.createElement( Gallery, {photos: this.state.photos,columns: this.state.columns,
       onClick: this.selectTile, 
       ImageComponent: ImageTile} )
      );
  }
}

/* Finally, we actually run some code */

const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App),reactContainer);

//var origTag = "none";

/* Workaround for bug in gallery where it isn't properly arranged at init */
window.dispatchEvent(new Event('resize'));


// Called when the user pushes the "submit" button 
// FIXME: add in the request for a specific number 
function photoByNumber() {
	//console.log("IN photo by photoByNumber");
	document.getElementById("mainbox").style.display = "none";

	var num = document.getElementById("num").value;
	num = num.trim();

	//num = num.split(" ").join(+); 
	//console.log("PIAZZA SPLIT: ",num);


	var oReq = new XMLHttpRequest(); // sending an AJAX request requires an object, so this makes an AJAX request object
	var url = "query?tags="+num;
	//origTag = num;

	//console.log("VALUE OF NUM BEFORE "+num);

	while(num.indexOf(",") != -1){
        num = num.replace(",","");
        numList++;
	}

	//num = num.replace(/ /g,"+");

	oReq.open("GET", url); // tell the server it's going to be a get request, and tell the AJAX request object to "open".
	// when you define a URL for an AJAX request, you don't give it the whole thing because it knows where the page was downloaded
	// from (the server site) and it knows the response will go back to that site.
	oReq.addEventListener("load", (evt) => { // this sets up a callback function -- on the load event (when it loads), call reqListener 
	// which is the callback function
		if (oReq.status == 200) {
		        reactApp.setState({photos:JSON.parse(oReq.responseText)});
		        //console.log("YO: ",oReq.responseText.tags);
		        window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
		} else {
		        console.log("oReq Error!", oReq.responseText);
		}
	});

	oReq.send(); //end the call
	
	

}

console.log(photos);