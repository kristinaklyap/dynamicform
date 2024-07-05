'use client'
import { z } from 'zod';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
const CMSData = [
    {
        "id": 1,
        "name": "SurveyInput",
        "props": {
            "labelKey": "dummy-question-1",
            "label": "<p>1. Dummy question 1?</p>\r\n",
            "placeholder": "Please specify your answer here",
            "mandatoryFieldErrorMsg": "Please fill this field"
        }
    },
    {
        "id": 2,
        "name": "SurveyInput",
        "props": {
            "labelKey": "dummy-question-2",
            "label": "<p>2. Dummy question 2?</p>\r\n",
            "placeholder": "Please specify your answer here",
            "mandatoryFieldErrorMsg": "Please fill this field"
        }
    },
    {
        "id": 3,
        "name": "SurveyCheckbox",
        "props": {
            "customAnswerVisible": true,
            "labelKey": "focus-areas",
            "customAnswerLabelKey": "other",
            "customAnswerLabel": "<p>Other (please specify)</p>\r\n",
            "label": "<p>Which areas of interest do you primarily focus on in the management? (Select all that apply) </p>\r\n",
            "customAnswerPlaceholder": "Type here",
            "items": [
                {
                    "labelKey": "adult-treatment",
                    "label": "<p>Adult Treatment</p>\r\n"
                },
                {
                    "labelKey": "pediatric-care",
                    "label": "<p>Pediatric Care</p>\r\n"
                },
                {
                    "labelKey": "different",
                    "label": "<p>Different</p>\r\n"
                }
            ]
        }
    },
    {
        "id": 4,
        "name": "SurveyCheckbox",
        "props": {
            "customAnswerVisible": true,
            "labelKey": "focus-areas",
            "customAnswerLabelKey": "other",
            "customAnswerLabel": "<p>Test</p>\r\n",
            "label": "<p> (Select all that apply) </p>\r\n",
            "customAnswerPlaceholder": "Type here",
            "items": [
                {
                    "labelKey": "adult-treatment",
                    "label": "<p>test1</p>\r\n"
                },
                {
                    "labelKey": "pediatric-care",
                    "label": "<p>test</p>\r\n"
                }
            ]
        }
    }
];

// Generate form schema and default values from CMSData

const FieldsSchema = z.union([
    z.object({
        type: z.literal('input'),
        value: z.string().min(1, 'Input cannot be empty'),
    }),
    z.object({
        type: z.literal('checkboxGroup'),
        checkboxes: z.array(z.boolean()).refine(
            checkboxes => checkboxes.some(checkbox => checkbox === true),
            {
                message: 'At least one checkbox must be checked',
            }
        ),
    })
]);

const formSchema = z.object({
    fields: z.union([FieldsSchema, FieldsSchema.array()]).transform((rel) => {
        return Array.isArray(rel) ? rel : [rel];
    }),
});

const generateDefaultValues = (cmsData) => {
    const defaultValues = cmsData.map(item => {
        const props = item.props || {};
        if (item.name === 'SurveyInput') {
            return { type: 'input', value: '' };
        } else if (item.name === 'SurveyCheckbox') {
            return { type: 'checkboxGroup', checkboxes: props.items?.map(() => false) || [] };
        } else {
            return null;
        }
    }).filter(Boolean);

    return { fields: defaultValues };
};

const defaultValues = generateDefaultValues(CMSData);

console.log('Schema:', formSchema);
console.log('Default Values:', defaultValues);

const Form = () => {
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = data => {
        console.log('data',data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="fields"
                control={control}
                render={({ field }) => (
                    <>
                        {field.value.map((fieldData, index) => {
                            const cmsItem = CMSData[index];
                            const props = cmsItem?.props || {};
                            switch (fieldData.type) {
                                case 'input':
                                    return (
                                        <div key={index}>
                                            <label dangerouslySetInnerHTML={{ __html: props.label }} />
                                            <input
                                                type="text"
                                                placeholder={props.placeholder}
                                                value={fieldData.value}
                                                onChange={(e) =>
                                                    field.onChange(field.value.map((item, i) =>
                                                        i === index ? { ...item, value: e.target.value } : item
                                                    ))
                                                }
                                            />
                                            {errors.fields?.[index]?.value && <p style={{color: 'red'}}>{errors.fields[index].value.message}</p>}
                                        </div>
                                    );
                                case 'checkboxGroup':
                                    return (
                                        <div key={index}>
                                            <label dangerouslySetInnerHTML={{ __html: props.label }} />
                                            {fieldData.checkboxes.map((checked, checkboxIndex) => (
                                                <label key={checkboxIndex} style={{display:'flex'}}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) =>
                                                            field.onChange(field.value.map((item, i) =>
                                                                i === index
                                                                    ? {
                                                                        ...item,
                                                                        checkboxes: item.checkboxes.map((val, ci) =>
                                                                            ci === checkboxIndex ? e.target.checked : val
                                                                        ),
                                                                    }
                                                                    : item
                                                            ))
                                                        }
                                                    />
                                                    <span dangerouslySetInnerHTML={{ __html: props.items?.[checkboxIndex]?.label || '' }} />
                                                </label>
                                            ))}
                                            {errors.fields?.[index]?.checkboxes && (
                                                <p style={{color: 'red'}}>{errors.fields[index].checkboxes.message}</p>
                                            )}
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </>
                )}
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default Form;
