import React from 'react';
import ReactDOM from 'react-dom';
// import dane from './wroclaw';

document.addEventListener('DOMContentLoaded', function(){


	class App extends React.Component {
		render() {
			return (
				<GetPosition />
			)
		}
	}


	class GetPosition extends React.Component {

		constructor(props){
            super(props);
            this.state={
                latitude: '',
				longitude: '',
				isHidden: true
            }
        }


		handleSetAddressButtonClick = () => {
			this.setState({isHidden: !this.state.isHidden})
		}

		handleButtonClick = () => {
			new Promise((resolve, reject) => {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition( position => {
						resolve([position.coords.latitude, position.coords.longitude]);
					})
				  } else {
				    alert('Precise location is not supported by this browser');
				  }
			})
			.then(res => this.setState({latitude: (res[0]).toFixed(8),
										longitude: (res[1]).toFixed(8)}))
			.catch( err =>  alert('Service is not available at the moment') )
		}

		handleLatitudeChange = event => {
			this.setState({
				latitude: event.currentTarget.value
			})
		};

		handleLongitudeChange = event => {
			this.setState({
				longitude: event.currentTarget.value
			})
		};

		render() {
			return (
				<section className="container">

					<div className="row row1">
							<form onSubmit={this.handleSubmit}>
								<label>
									<input type="text" placeholder='LATITUDE' className="localisationForm" value={this.state.latitude} onChange={event => this.handleLatitudeChange(event)} />
								</label>
								<label>
									<input type="text" placeholder='LONGITUDE' className="localisationForm" value={this.state.longitude} onChange={event => this.handleLongitudeChange(event)} />
								</label>
							</form>
							<button onClick={this.handleButtonClick} className="localisationButton"></button>
					</div>

				 	<GetLocasion latitude={this.state.latitude} longitude={this.state.longitude}/>
				</section>
			)
		}
	}


	class GetLocasion extends React.Component {

		constructor(props) {
			super(props);
			this.state= {
				chargeStations: []
			}
		}

		getData = () => {
			if ((this.props.latitude === "") || (this.props.longitude === "")) {
				alert('Location is not set');
				this.setState({ chargeStations: [] })
			} else {
				let latitude = this.props.latitude;
				let longitude = this.props.longitude;


				// this.setState({ chargeStations: dane })
				fetch(`https://api.openchargemap.io/v2/poi/?output=json&latitude=${latitude}&longitude=${longitude}&distanceunit=KM&maxresults=60`)
				.then(res => res.json())
				.then(t => this.setState({ chargeStations: t }))
				.catch( err =>  alert('Service is not available at the moment') );
				console.log(this.state.chargeStations);
			}

		}

		render() {
			return (
				<div className="row2">
					<button onClick={this.getData} className="uppercase buttonShowResult">show result </button>
					<Cards chargeStations={this.state.chargeStations} lat={this.props.latitude} long={this.props.longitude}/>
				</div>
			)
		}
	}


	class Cards extends React.Component {

		render() {
			// const result = this.props.chargeStations.map( station => <div key={station.ID}  className="card">{station.AddressInfo.Title}, {station.AddressInfo.AddressLine1}, {station.AddressInfo.Town}</div> )
			const result = this.props.chargeStations.map( station => <Card key={station.ID} station={station} lat={this.props.lat} long={this.props.long}/> )
			return (
				<div>
					{result}
				</div>
			)
		}
	}


	class Card extends React.Component {

		constructor(props) {
			super(props);
			this.state = {
				isMoore: false
			}
		}

		moreData = () => {
			this.setState({isMoore: !this.state.isMoore})
		}

		render() {
			let operatorClass;
			if (!(this.props.station.StatusType.IsOperational==null)) {
				if (this.props.station.StatusType.IsOperational) {
					operatorClass = 'status statusOk';
				} else if (!this.props.station.StatusType.IsOperational) {
					operatorClass = 'status statusNook';
				} else {
					operatorClass = 'status statusQuestion';
				}
			} else {
				operatorClass = 'status statusQuestion';
				console.log("dupa");
			}



			let rowUsage
			if (!(this.props.station.UsageTypeID==null)) {rowUsage = <p className="smallerText">USAGE:  {this.props.station.UsageType.Title}</p>}

			// console.log(this.props.station.UsageType.Title);
			return (
				<section className="stationCard">
					<section className="stationCardFirstRow">
							<div className="distanceArea"><p>{(this.props.station.AddressInfo.Distance).toFixed(1)}</p><p>km</p></div>
							<div className="adressArea">
								<p className="title">{this.props.station.AddressInfo.Title}</p>
								<p className="biggerText">{this.props.station.AddressInfo.AddressLine1}</p>
								<p className={(this.props.station.AddressInfo.AddressLine2== null) ? 'nonActive' : 'biggerText'}>{this.props.station.AddressInfo.AddressLine2}</p>
								<p className="biggerText">{this.props.station.AddressInfo.Country.ISOCode}  {this.props.station.AddressInfo.Town}</p>

								{/* <p className={(this.props.station.AddressInfo.RelatedURL== null) || !(this.state.isMoore) ? 'nonActive' : 'smallerText'}>{this.props.station.AddressInfo.RelatedURL}</p> */}
								<a href={this.props.station.AddressInfo.RelatedURL}  target="_blank" className={(this.props.station.AddressInfo.RelatedURL== null) || !(this.state.isMoore) ? 'nonActive' : 'smallerText'}> www </a>
								<p className={(this.props.station.AddressInfo.ContactEmail== null) || !(this.state.isMoore) ? 'nonActive' : 'smallerText'}>{this.props.station.AddressInfo.ContactEmail}</p>
								<p className={(this.props.station.AddressInfo.ContactTelephone1==null) || !(this.state.isMoore) ? 'nonActive' : 'smallerText'}>{this.props.station.AddressInfo.ContactTelephone1}</p>
							</div>
							<div className="statusArea">
								<div className={operatorClass}></div>
								<div className="uppercase">status</div>
							</div>
					</section>
					<CardUsage station={this.props.station} isMoore={this.state.isMoore}/>
					<CardPower station={this.props.station} isMoore={this.state.isMoore}/>
					<CardMedia station={this.props.station} isMoore={this.state.isMoore}/>
					<CardNavigate station={this.props.station} isMoore={this.state.isMoore} lat={this.props.lat} long={this.props.long}/>
					<section className="divMoreButton">
						<div  onClick={this.moreData} className={(this.state.isMoore) ? 'moreButton moreLessButton' : 'moreButton moreMoreButton'}></div>
					</section>
				</section>
			)
		}
	}

	class CardUsage extends React.Component {

		render() {
			let rowUsage
			if (!(this.props.station.UsageTypeID==null)) {rowUsage = <p className="smallerText"><span>USAGE:  </span>{this.props.station.UsageType.Title}</p>}

			return (
				<section className={!(this.props.isMoore) ? 'nonActive' : 'stationCardSecondRow'}>
					<div className="underline"></div>
					{rowUsage}
					<p className={(this.props.station.UsageCost==null) ? 'nonActive' : 'smallerText'}><span>USAGE COST:  </span>{this.props.station.UsageCost}</p>
					<p className="smallerText"><span>OPERATOR:  </span>{this.props.station.OperatorInfo.Title} {this.props.station.OperatorInfo.PhonePrimaryContact}</p>
					<section className="infoArea">
						<p className={(this.props.station.GeneralComments==null) ? 'nonActive' : 'boo'}><span>INFO:  </span></p>
						<p className={(this.props.station.GeneralComments==null) ? 'nonActive' : 'smallerText boo1'}>{this.props.station.GeneralComments} </p>
					</section>
				</section>
			)
		}
	}

	class CardPower extends React.Component {

		render() {
			const power = this.props.station.Connections.map( connections => <Connections key={connections.ID} connections={connections}/> )
			return (
				<section className={!(this.props.isMoore) ? 'nonActive' : 'stationCardThirdRow'}>
					<div className="underline"></div>
					<div className="descryptionArea">
						<p className="descryption">Charge Speed</p>
						<p className="descryption">Plug Type</p>
						<p className="descryption">Quantity</p>
					</div>
						{power}
				</section>
			)
		}
	}

	class Connections extends React.Component {
		render() {

			let operatorClass;
			switch (this.props.connections.LevelID) {
				case 1:
					operatorClass = 'chargePicture slow';
			        break;
				case 2:
					operatorClass = 'chargePicture fast';
					break;
				case 3:
					operatorClass = 'chargePicture rapid';
					// console.log(this.props.connections);
					break;
				default:
					operatorClass = 'chargePicture other';
					// console.log(this.props.connections.ID);
			}

			let operatorClass2;
			// console.log(this.props.connections.ConnectionType.ID);

			switch (parseInt(this.props.connections.ConnectionTypeID)) {
				case (13 || 18):
					// console.log("schucko"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug1';
			        break;
				case (23):
					// console.log("schucko"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug1';
					break;
				case (28):
					// console.log("schucko"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug1';
					break;
				case 2:
					// console.log("czademo"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug2';
					break;
				case 33:
					// console.log("css"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug3';
					break;
				case (1 || 32):
					// console.log("J1772"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug4';
					break;
				case (1036 || 1038):
					// console.log("mennesman"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug5';
					break;
				case (25 || 1039):
					// console.log("mennesman"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug5';
					break;
				case (8):
					// console.log("Tesla8"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug6';
					break;
				case (27):
						// console.log("Tesla27"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug6';
					break;
				case (30):
					// console.log("Tesla"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug6';
					break;
				case (17):
					// console.log("Tesla"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug7';
					break;
				case (35):
					// console.log("Tesla"+ this.props.connections.ConnectionType.ID);
					operatorClass2 = 'plugPicture plug7';
					break;
				default:
					operatorClass2 = 'plugPicture other';
					// console.log(this.props.connections.ConnectionType.ID);
			}

			let quantity;
			 !(this.props.connections.Quantity==null)? quantity = <p className="quantity">{this.props.connections.Quantity}</p> : quantity = <p className="quantity">?</p>;

			 let level;
			 switch (this.props.connections.LevelID) {
				 case (1):
					 level = 'Slow';
					 break;
				 case (2):
					 level = 'Fast';
					 break;
				 case (3):
					 level = 'Rapid';
					 break;
				 }
				 // console.log(this.props.connections.StatusType.IsOperational);
			return (
				<div className="connection">
					<div className="chargeSpeed">
						<div className={operatorClass}></div>
						<p className="descryption">{level}</p>
						<p className="descryption">Level {this.props.connections.LevelID}</p>
					</div>
					<div className="plugType">
						<div className={operatorClass2}></div>
						<p className="descryption">{this.props.connections.ConnectionType.Title}</p>
					</div>
					<div className="numberOfStations">
						{quantity}
					<p className="descryption">Bays</p>
					</div>
				</div>
			)
		}
	}

	class CardMedia extends React.Component {

		render() {

			let photoItem;
			let line;
			 if (!(this.props.station.MediaItems == null)) {
				 console.log(this.props.station.MediaItems);
				 line = <div className="underline"></div>;
				 photoItem = this.props.station.MediaItems.map( mediaItem => <MediaItem key={mediaItem.ID} mediaItem={mediaItem}/> );
			 };

			return (
				<section className={!(this.props.isMoore) ? 'nonActive' : 'stationCardFourthRow'}>
					{line}
					{photoItem}
				</section>
			)
		}
	}

	class MediaItem extends React.Component {

		render() {
			return (
				<div className='photo'>
					<a href={this.props.mediaItem.ItemURL} target="_blank"><img src={this.props.mediaItem.ItemThumbnailURL} alt="Charge Stations photography" height="100%" width="100%"/></a>
					{/* <div className='photo'><img src={this.props.mediaItem.ItemThumbnailURL} alt="Charge Stations photography" height="100%" width="100%"/></div> */}
				</div>
			)
		}
	}

	class CardNavigate extends React.Component {

		constructor(props) {
			super(props);
			this.state = {
				navStart: false
			}
		}

	handleNavigateButtonClick = () => {
		this.setState({navStart: !this.state.navStart})
	}

		render() {

			return (
				<section className={!(this.props.isMoore) ? 'nonActive' : 'stationCardFifthRow'}>
					<div className="underline"></div>
					<div className="uppercase navigateButton" onClick={this.handleNavigateButtonClick}>
						<a href={`https://www.google.es/maps/dir/${this.props.lat},${this.props.long}/${this.props.station.AddressInfo.Latitude},${this.props.station.AddressInfo.Longitude}`}  target="_blank" className="navigateLink"> navigate </a>
					</div>
				</section>
			)
		}
	}




    ReactDOM.render(
        <App/>,
        document.getElementById('app')
    );
});
// 18.08
