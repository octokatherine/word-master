const renderErrors = (errors: any, className: string) => {
    let validationMessages = [];

    if (errors.length) {
        validationMessages = errors.map((error: any) => {
            /* 
                TODO: This 'message' property is only necessary because of the 'password-valditor' library.
                This can be refactored now that we're also using validator.js
            */
            // @ts-ignore
            return <div className={className}>{error.message}</div>
        });
    } else {
        validationMessages.push(<div className={'text-[#15B097] text-sm'}>Looking good!</div>);
    }

    return validationMessages;
}

export {
    renderErrors,
}