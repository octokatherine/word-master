import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children, redirectTo,  }: any) => {
    console.log('protected', { user})
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default ProtectedRoute;