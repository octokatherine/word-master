import React, { Fragment, useEffect, useCallback, useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, } from "firebase/auth";
import { Default } from 'react-spinners-css';
import passwordValidator from 'password-validator';
import * as EmailValidator from 'email-validator';
import { useNavigate } from "react-router-dom";

import { renderServerErrors } from '../utils/misc';

const passwordRequirements = new passwordValidator();

passwordRequirements
	.is().min(8, 'Password must have a minimum of 8 characters.')
	.is().max(25, 'Password can only have a maximum of 25 characters.')
	.has().not('', 'Password cannot have spaces').spaces();

type Props = {
//   letterStatuses: { [key: string]: string }
//   gameDisabled: boolean
//   onDeletePress: () => void
//   onEnterPress: () => void
//   addLetter: any
}

type EmailError = {
	message: string,
	isEmailError: boolean,
}

// TODO: Need to add logic for if the email already exists
const Register = ({}: Props) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [verifyPassword, setVerifyPassword] = useState('');
	const [isRegistrationReady, setIsRegistrationReady] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [validationErrors, setValidationErrors] = useState([]);
	const [serverErrors, setServerErrors] = useState([]);

	const navigate = useNavigate();

	const handleRegistration = () => {
		// TODO: Should probably be some kind of server validation for this, at some point, and not just front end
		if (!isRegistrationReady) return;
	
	    const auth = getAuth();

		setIsRegistering(true);

		// @ts-ignore
		createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			navigate('/game');
		})
		.catch((error) => {
			const { code, message } = error;

			let serverErrors = [];

			if (code.includes('auth/email-already-in-use')) {
				serverErrors.push({ message: 'Email is already in use.' });
			}

			if (serverErrors.length) setIsRegistering(false);

			// @ts-ignore
			setServerErrors(serverErrors);
		});
	}

	const renderValidationErrors = () => {
		if (!validationErrors.length) return;

		return validationErrors.map((validationError) => {
			// @ts-ignore
			return <div className="text-red-600 text-sm">{validationError.message}</div>
		});
	}

	const isValidEmail = () => {
		// Validation from passwordValidator will always include the 'validation' property
		return !validationErrors.some((validationError: EmailError) => validationError.isEmailError);
	}

	const isValidPassword = () => {
		// @ts-ignore
		return !validationErrors.some((validationError: object) => validationError.validation);
	}

	// TODO: Need to bring in proper validation, with something like validate.js
	const isValidRegistration = useCallback(() => {
		const passwordErrors = passwordRequirements.validate(password.trim(), { details: true }) as any[];
		const validatedPasswordErrors = passwordRequirements.validate(verifyPassword.trim(), { details: true }) as any[];
		const isValidEmail = EmailValidator.validate(email);

		/*
			validate() returns an array containing all errors. if it returns an empty array,
			we can take that to mean there are no errors
		*/
		let validationErrors = [];

		if (password.trim() !== verifyPassword.trim()) {
			validationErrors = [{ message: 'Passwords must match.', validation: 'matching' }];
		} else if (passwordErrors.length || validatedPasswordErrors.length) {
			// Filters out duplicates
			const combinedErrors = [...passwordErrors, ...validatedPasswordErrors].filter((error, index, self) => {
				return index === self.findIndex((foundError) => {
					return foundError.message === error.message;
				});
			});

			// @ts-ignore
			validationErrors = combinedErrors;
		} 

		if (!isValidEmail) validationErrors.push({ message: 'Must be a valid email.', isEmailError: true } as EmailError);
		
		// @ts-ignore
		setValidationErrors(validationErrors);
		return validationErrors.length === 0;
	}, [password, verifyPassword, email]);

	useEffect(() => {
		if (isValidRegistration()) {
			setIsRegistrationReady(true);
		} else {
			setIsRegistrationReady(false);
		}
	}, [password, verifyPassword, email, isValidRegistration]);

	return (
		<div className="min-h-full flex flex-col gap-y-4 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-y-4 w-80">
				<div>
					<label htmlFor="email-address" className="sr-only">Email address</label>

					<input id="email-address" name="email" type="email" autoComplete="email" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${!isValidEmail() ? 'border-red-500 focus:border-red-500 focus:ring-red-500': ''}`}placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}/>
				</div>

				<div>
					<label htmlFor="password" className="sr-only">Password</label>

					<input id="password" name="password" type="password" autoComplete="current-password" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${!isValidPassword() ? 'border-red-500 focus:border-red-500 focus:ring-red-500': ''}`} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
				</div>

				<div>
					<label htmlFor="password" className="sr-only">Verify Password</label>

					<input id="password" name="password" type="password" autoComplete="current-password" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${!isValidPassword() ? 'border-red-500 focus:border-red-500 focus:ring-red-500': ''}`} placeholder="Verify password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)}/>
				</div>

				<div className="flex flex-col">
					{renderValidationErrors()}
				</div>

				{/* TODO: Abstract this into a SubmitButton component */}
				<button disabled={!isRegistrationReady} onClick={handleRegistration} className={`bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-x-1.5 ${isRegistrationReady ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}>
					{isRegistering ? <Fragment><span>Registering...</span> <Default color="#fff" size={20}/></Fragment> : <span>Sign Up with Email</span>}
				</button>

				<div className="flex flex-col">
					{renderServerErrors(serverErrors)}
				</div>
			</div>
		</div>
	)
}

export default Register;
