import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  VStack,
  HStack,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import CommonAlert from '../Common/CommonAlert';

export interface Field {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  options?: { value: number; label: string }[];
  required?: boolean;
}

interface GenericFormProps {
  initialValues: { [key: string]: any };
  fields: Field[];
  onSubmit: (values: any, isDelete: boolean) => void;
}

function GenericForm ({ initialValues, fields, onSubmit }: GenericFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const { 
    isOpen: isOpenAlert, 
    onOpen: onOpenAlert, 
    onClose: onCloseAlert
  } = useDisclosure();
  const cancelRef = useRef(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Perform validation here
    const formErrors = validateForm(values);
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(values, false);
    }
  };

  const validateForm = (values: { [key: string]: any }) => {
    // Implement your own validation logic here
    let errors: { [key: string]: string } = {};

    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    return errors;
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack w='full' spacing={4} mt={10} >
        <VStack w='full' px={6} spacing={4}>
          {fields.map((field) => (
            <FormControl key={field.name} isInvalid={errors[field.name as keyof typeof errors]}>
              <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
              {field.type === 'select' ? (
                <Select
                  id={field.name}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                >
                  {field.options!.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                />
              )}
              <FormErrorMessage>{errors[field.name as keyof typeof errors]}</FormErrorMessage>
            </FormControl>
          ))}
        </VStack>

        <Divider />

        <HStack spacing={0} w='full'>
          <Button 
            type='submit'
            rounded={0}
            w='full'
            value='save'
          >
            Save
          </Button>
          {initialValues['ID'] && 
            <Button 
              rounded={0}
              colorScheme='red'
              w='full'
              value='delete'
              onClick={onOpenAlert}
            >
              Delete
            </Button>
          }
        </HStack>
      </VStack>

      <CommonAlert 
        name='Agent'
        cancelRef={cancelRef}
        isOpen={isOpenAlert}
        onClose={onCloseAlert}
        onDelete={()=>{
          onCloseAlert();
          onSubmit(values, true);
        }}
      />
    </form>
  );
};

export default GenericForm;