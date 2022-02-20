// import { Navigate } from 'react-router-dom';
import { Ripple } from 'react-spinners-css';

const Loading = ({}: any) => {
    return (
        <div className="grid place-items-center h-screen">
            <Ripple size={200} />
        </div>
    );
};

export default Loading;