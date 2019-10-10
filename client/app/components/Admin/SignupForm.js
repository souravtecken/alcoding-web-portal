import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import ReactLoading from 'react-loading';

class SignupForm extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: true,
			group_name: "",
			termEndYear: "",
			category: "student"
		}
		this.handleSubmitUsers = this.handleSubmitUsers.bind(this);
		this.handleSubmitContenders = this.handleSubmitContenders.bind(this);
		this.handleSubmitGroup = this.handleSubmitGroup.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
		this.fileInput = React.createRef();
		this.fileInput_contest = React.createRef();
		this.fileInput_group = React.createRef();
		this.changeGroupName = this.changeGroupName.bind(this);
		this.changeTermEndYear = this.changeTermEndYear.bind(this);
		this.handleCategoryChange = this.handleCategoryChange.bind(this);
	}

	componentDidMount() {
		var token = localStorage.getItem('token');
		var userID = localStorage.getItem('user_id');
		var self = this;
		var apiPath = '/api/account/' + userID + '/details'
		axios.get(apiPath, {
			headers: {
				'x-access-token': token,
				'Content-Type': 'application/json'
			}
		})
			.then(function (response) {
				self.setState({
					isLoading: false
				});
				var data = response.data;
				if (data.user.role != "admin") {
					self.props.history.push('/');
				}
			})
			.catch(function (error) {
				console.log(error);
				self.props.history.push('/');
			});
	}

	handleSubmitUsers(event) {
		event.preventDefault();
		var fileObj = this.fileInput.current.files[0];
		var token = 'Bearer ' + localStorage.getItem('token');
		var configSignup = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': token
			}
		};
		var signUpUrl = '/api/admin/signupMembers';
		const NO_OF_MANDATORY_FIELDS = 3; //NUMBER OF FIELDS MANDATORY FOR SIGNUP.
		var reader = new FileReader();
		var createGroupUrl = '/api/admin/createGroup';
		var category = this.state.category;
		reader.onload = function (file) {
			var data = file.target.result.split('\n');
			var row, invalid, attributes, count;
			for (var row_count = 0; row_count < data.length; row_count++) {
				row = data[row_count];
				invalid = 0;
				attributes = row.split(',');
				for (count = 0; count < NO_OF_MANDATORY_FIELDS; count++) {
					if (attributes[count] == "") { invalid = 1; }
				};//to check cases where there are blank fields for each user
				if (!invalid) {
					var groupBody;
					var body = "firstName=" + attributes[0];
					body += '&email=' + attributes[1];
					if(category === 'student'){ 
						body += '&usn=' + attributes[2];
						groupBody = 'name=students'
					}
					else {
						body += '&employeeID=' + attributes[2];
						groupBody = 'name=prof'
					}
					axios.post(signUpUrl, body, configSignup)
						.then(function (response) {
							console.log(response.data);
							groupBody += '&termEndYear=' + parseInt('-1') + '&email=' + attributes[1];
							axios.post(createGroupUrl, groupBody, configSignup)
							.then(function (response) {
								console.log(response.data);
							})
							.catch(function (err) {
								console.log(err);
							})
						})
						.catch(function (err) {
							console.log(err.response);
						})
				}
				else {
					console.log("error at user: " + attributes);
				}
			}
		}
		if (fileObj) {
			reader.readAsText(fileObj, "UTF-8");
		}
		else { console.log('Please Upload a file!'); }
	}

	handleSubmitContenders(event) {
		event.preventDefault();
		var fileObj = this.fileInput_contest.current.files[0];
		var token = 'Bearer ' + localStorage.getItem('token');
		var configSignup = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': token
			}
		};
		var signUpUrl = '/api/contests/updateContenders';
		var reader = new FileReader();
		reader.onload = function (file) {
			var data = JSON.parse(file.target.result);
			for (var key in data) {
				// console.log(key + " -> " + data[key]);
				var body = "usn=" + key;
				body += "&name=" + data[key].name;
				body += "&email=" + data[key].email;
				body += "&rating=" + data[key].rating;
				body += "&volatility=" + data[key].volatility;
				body += "&timesPlayed=" + data[key].timesPlayed;
				body += "&lastFive=" + data[key].lastFive;
				body += "&best=" + data[key].best;
				body += "&codejam=" + data[key].codejam;
				body += "&hackerearth=" + data[key].hackerearth;

				axios.post(signUpUrl, body, configSignup)
					.then(function (response) {
						console.log(response.data);
					})
					.catch(function (err) {
						console.log(err);
					})
			}
		}

		if (fileObj) {
			reader.readAsText(fileObj, "UTF-8");
		}
		else { console.log('Please Upload a file!..'); }
	}

	handleSubmitGroup(e) {
		e.preventDefault();
		var fileObj = this.fileInput_group.current.files[0];
		var token = 'Bearer ' + localStorage.getItem('token');
		var configSignup = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': token
			}
		};
		var createGroupUrl = '/api/admin/createGroup';
		var reader = new FileReader();
		var body = 'name=' + this.state.group_name + '&termEndYear=' + parseInt(this.state.termEndYear);
		reader.onload = function (file) {
			var data = file.target.result.split('\n');
			for (var row_count = 0; row_count < data.length; row_count++) {
				var row = data[row_count].split(',')[0];
				var obj = body + '&email=' + row
				console.log(obj);
				axios.post(createGroupUrl, obj, configSignup)
					.then(function (response) {
						console.log(response.data);
					})
					.catch(function (err) {
						console.log(err);
					})
			}
		}

		if (fileObj) {
			reader.readAsText(fileObj, "UTF-8");
		}
		else { console.log('Please Upload a file!..'); }
	}

	changeGroupName(e) {
		this.setState({
			group_name: e.target.value
		})
	}

	changeTermEndYear(e) {
		this.setState({
			termEndYear: e.target.value
		})
	}

	handleDownload(event) {
		event.preventDefault();
	}

	handleCategoryChange(event) {
		this.setState({
			category: event.target.value
		})
	}

	render() {
		const updatedHandlesWtoken = "/api/contests/updatedHandles?token=" + localStorage.getItem('token');
		if (this.state.isLoading)
			return <ReactLoading />;
		else
			return (
				<div className='container-fluid'>
					<h3>Upload Student Details: </h3>
					<form id="formObject">
						<span>Enter category of users to signup</span>
						<select className='form-control col-2' value={this.state.category} onChange={this.handleCategoryChange} required>
							<option value='student'>Students</option>
							<option value='professor'>Professors</option>
						</select>
						<span>Please upload a .csv file with format - </span>
						<input type="file" className="btn btn-default form-control" ref={this.fileInput} />
						<br />
						<button type="submit" className="btn btn-dark form-control col-2" onClick={this.handleSubmitUsers}>Submit</button>
					</form>
					<br />
					<h3>Upload/Download Contender Details: </h3>
					<form id="formObject">
						<span>Please upload a .json file</span>
						<input type="file" className="btn btn-default form-control" ref={this.fileInput_contest} />
						<br />
						<button type="submit" className="btn btn-dark form-control col-2" onClick={this.handleSubmitContenders}>Submit</button> &nbsp;
					{/* <button type="submit" className="btn btn-dark form-control col-2" onClick={this.handleDownload}>Download</button> */}
						<a href={updatedHandlesWtoken} className="btn btn-dark form-control col-2">Download</a>
					</form>
					<br />
					<h3>Create New Group: </h3>
					<form id="formObject">
						<span>Name of Group: <input type="text" className="form-control col-2" placeholder="Group Name" value={this.state.group_name} onChange={this.changeGroupName} /></span>
						<span>Term End Year: <input type="text" className="form-control col-2" placeholder="Term End Year" value={this.state.termEndYear} onChange={this.changeTermEndYear} /></span>
						<span>Please upload a csv file of student USN's in group</span>
						<input type="file" className="btn btn-default form-control" ref={this.fileInput_group} />
						<br />
						<button type="submit" className="btn btn-dark form-control col-2" onClick={this.handleSubmitGroup}>Submit</button> &nbsp;
					</form>
				</div>
			);
	}
}

export default SignupForm;