const renderServerErrors = (serverErrors: any) => {
    if (!serverErrors.length) return;

    return serverErrors.map((serverError: any) => {
        // @ts-ignore
        return <div className="text-blue-600 text-sm">{serverError.message}</div>
    });

}

export {
    renderServerErrors,
}