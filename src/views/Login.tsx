import { useState } from 'react'
import { Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { renderServerErrors } from '../utils/misc';
import useStore from '../utils/store';

type Props = {
//   letterStatuses: { [key: string]: string }
//   gameDisabled: boolean
//   onDeletePress: () => void
//   onEnterPress: () => void
//   addLetter: any
}

const Login = ({}: Props) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [serverErrors, setServerErrors] = useState([]);
	
	const handleSignIn = () => {
		const auth = getAuth();

		signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in 
			const user = userCredential.user;
			useStore.setState({ user });
			console.log('successfully logged in');
		})
		.catch((error) => {
			const { code } = error;

			console.log({ code })
			let serverErrors = [];

			switch (code) {
				case 'auth/invalid-email':
					serverErrors.push({ message: 'Not a valid email account.'});
					break;
				case 'auth/user-not-found':
					serverErrors.push({ message: 'No accounts with that email.'});
					break;
				case 'auth/too-many-requests':
					serverErrors.push({ message: 'Too many attempts. Try again n a few minutes.'});		
					break;
				case 'auth/wrong-password':
					serverErrors.push({ message: 'Incorrect login.'});
					break;
				case 'auth/internal-error':
					serverErrors.push({ message: 'Error while logging in. Please try again.'});
					break;
				default:
					break;
			}

			// @ts-ignore
			setServerErrors(serverErrors);
		});
	}

	return (
		<div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-lg w-full space-y-8">
				<div>
					<h1 className="text-center text-6xl">Wordles with Friendles</h1>
					<h2 className="mt-2 text-center text-2xl text-gray-900">Sign In</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Or
						<Link className="font-medium text-indigo-600 hover:text-indigo-500 block" to="/register">Register (It's free!)</Link>
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<input type="hidden" name="remember" value="true" />
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email-address" className="sr-only">Email address</label>
							<input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}/>
						</div>

						<div>
							<label htmlFor="password" className="sr-only">Password</label>
							<input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
						</div>
					</div>

					<div className="flex flex-col">
						{renderServerErrors(serverErrors)}
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
							<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900"> Remember me </label>
						</div>

						<div className="text-sm">
							<a href="#" className="font-medium text-indigo-600 hover:text-indigo-500"> Forgot your password? </a>
						</div>
					</div>

					<div className="flex flex-col gap-y-4">
						<button className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={handleSignIn}>
							<span className="absolute left-0 inset-y-0 flex items-center pl-3">
								<svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
								</svg>
							</span>
							Sign in
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login;
