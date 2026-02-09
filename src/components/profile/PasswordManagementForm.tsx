// components/profile/PasswordManagementForm.tsx
import type {UserResponse} from '@/types/user';
import {BindPasswordForm, type BindPasswordFormValues} from './BindPasswordForm';
import type {ChangePasswordFormValues} from "@/types/auth.ts";
import {ChangePasswordForm} from "@/components/profile/ChangePasswordForm.tsx";

interface PasswordManagementFormProps {
    user: UserResponse;
    onChangePassword: (data: ChangePasswordFormValues) => Promise<void>;
    onBindPassword: (data: BindPasswordFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export function PasswordManagementForm({
                                           user,
                                           onChangePassword,
                                           onBindPassword,
                                           isSubmitting
                                       }: PasswordManagementFormProps) {
    if (user.localUser) {
        return (
            <ChangePasswordForm
                onSubmit={onChangePassword}
                isSubmitting={isSubmitting}
            />
        );
    }

    return (
        <BindPasswordForm
            onSubmit={onBindPassword}
            isSubmitting={isSubmitting}
        />
    );
}