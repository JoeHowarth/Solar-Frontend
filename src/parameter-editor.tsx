import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Box } from "bloomer/lib/elements/Box";
import { withRouter } from "react-router-dom";

const ParameterEditor = ({ history, params: [params, setParams] }) => {
    console.log("from parameter editor");
    return (
        <Formik
            initialValues={params}
            onSubmit={value => {
                setParams(value);
                history.goBack()
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    {Object.keys(params).map(name => (
                        <EField name={name} type="text" key={name} />
                    ))}
                    <SubmitCancel isSubmitting={isSubmitting} />
                </Form>
            )}
        </Formik>
    );
};

const SubmitCancel = ({ isSubmitting }) => (
    <div className="field is-grouped">
        <div className="control">
            <button disabled={isSubmitting} className="button is-link">
                Submit
            </button>
        </div>
        <div className="control">
            <button className="button is-light">Cancel</button>
        </div>
    </div>
);

const EField = ({ name, type }) => (
    <div className="field">
        <label className="label">{name}</label>
        <div className="control">
            <Field
                className="input"
                name={name}
                placeholder={name}
                type={type}
            />
            <ErrorMessage name={name} component="div" />
        </div>
    </div>
);

export default withRouter(ParameterEditor);
