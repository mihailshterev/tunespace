import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "./input";

interface InputProps<T extends FieldValues> {
  type: string;
  placeholder: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  error: string | undefined;
}

const FormInput = <T extends FieldValues>({
  type,
  placeholder,
  register,
  name,
  error,
}: InputProps<T>) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <Input type={type} placeholder={placeholder} {...register(name)} />
      <p className="text-orange-600">{error}</p>
    </div>
  );
};

export default FormInput;
