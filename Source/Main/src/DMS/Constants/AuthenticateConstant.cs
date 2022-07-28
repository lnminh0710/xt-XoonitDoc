using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Constants
{
    public static class AuthenticateConstant
    {
        #region REGEX VALIDATION
        public const string REGEX_EMAIL = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$";
        public const string REGEX_EMAIL_MES = "Invalid email format!";
        public const string REGEX_PASSWORD = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{9,}$";
        public const string REGEX_PASSWORD_MES = "Invalid password format!";
        #endregion

        public static string TokenTarget = "TokenTarget";
    }

    public enum TargetToken
    {
        SIGN_IN = 1,
        NEW_PASSWORD = 2,
        RESEND_NEW_PASSWORD = 3,
        RESET_PASSWORD_SUCCESS = 4,
        FORGOT_PASSWORD = 5,
        UPDATE_PASSWORD = 6,
        RESET_PASS_BY_ADMIN_SUCCESS = 7
    }
}
