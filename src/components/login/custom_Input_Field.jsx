import React from 'react'

function Custom_Input_Field(props) {
    return (
        <>
            <div className="flex flex-col">
                <label htmlFor={props.id} className="mb-2 text-sm font-medium text-gray-700">
                    {props.Label}
                </label>
                <input
                    id={props.id}
                    value={props.value}
                    onChange={props.onChange}
                    type={props.type || "text"}
                    className="  mt-1 py-2 text-black bg-gray-100  sm:px-4 sm:py-2 rounded-md border border-black w-100 sm:w-96"
                    placeholder={props.placeholder}
                />
            </div>
        </>
    )
}

export default Custom_Input_Field