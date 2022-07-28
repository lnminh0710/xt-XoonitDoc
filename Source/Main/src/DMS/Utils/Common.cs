using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using DMS.Models;
using System.Dynamic;
using System.ComponentModel;
using System.Text.RegularExpressions;
using System.Web;
using System.Collections.Specialized;
using DMS.Constants;

namespace DMS.Utils
{
    public static class Common
    {
        #region Encrypt
        public static string XeNaLogoCid = "XeNaLogo";
        // <summary>
        /// passPhrase
        /// </summary>
        private static Byte[] passPhrase = null;

        private const char SplitCharacter = ',';

        private const string EncryptKey = "5, 57, 23, 124, 23, 88, 49, 17, 4, 127, 157, 39, 44, 98, 113, 205";

        /// <summary>
        /// This takes a string, encrypts it, and then encodes it in a manner safe for URL use,
        /// with no additional encoding required. The return value is also safe to use with MVC,
        /// as there will be no slashes or plus signs in it.
        /// 
        /// NOTE: This method and the decryption method currently expect ASCII text to be used,
        /// in order to save some length on the resulting URLs. These could be updated to use 
        /// Unicode instead quite easily.
        /// </summary>
        /// <param name="toEncrypt"></param>
        /// <returns>An encrypted and encoded URL-safe string.</returns>
        public static string Encrypt(string toEncrypt)
        {
            Byte[] b = System.Text.Encoding.ASCII.GetBytes(toEncrypt);
            RC4(b);
            return Convert.ToBase64String(b);
        }

        /// <summary>
        /// This takes an encrypted string and decodes it from the URL-safe version, then
        /// decrypts it, and returns it to you.
        /// 
        /// NOTE: This method and the encryption method currently expect ASCII text to be used,
        /// in order to save some length on the resulting URLs. These could be updated to use 
        /// Unicode instead quite easily.
        /// </summary>
        /// <param name="toOriginalString">The encoded and encrypted string to be used.</param>
        /// <returns>A decrypted string.</returns>
        public static string Decrypt(string toOriginalString)
        {
            Byte[] b = Convert.FromBase64String(toOriginalString);
            RC4(b);
            return System.Text.Encoding.ASCII.GetString(b);
        }

        /// <summary>
        /// Our current encryption algorithm is RC4 256. We could plugin a different 
        /// algorithm later if so desired.
        /// </summary>
        /// <param name="value">The byte[] array to be encrypted.</param>
        public static void RC4(Byte[] value)
        {
            if (value == null || value.Length == 0) return;

            Byte[] passphrase = PassPhraseKey;
            int keylength = PassPhraseKey.GetLength(0);

            Byte[] s = new Byte[256];
            Byte[] k = new Byte[256];
            Byte temp;
            int i, j;

            for (i = 0; i < 256; i++)
            {
                s[i] = (Byte)i;
                k[i] = passphrase[i % keylength];
            }

            j = 0;
            for (i = 0; i < 256; i++)
            {
                j = (j + s[i] + k[i]) % 256;
                temp = s[i];
                s[i] = s[j];
                s[j] = temp;
            }

            i = j = 0;
            for (int x = 0; x < value.GetLength(0); x++)
            {
                i = (i + 1) % 256;
                j = (j + s[i]) % 256;
                temp = s[i];
                s[i] = s[j];
                s[j] = temp;
                int t = (s[i] + s[j]) % 256;
                value[x] ^= s[t];
            }
        }

        /// <summary>
        /// Return PassPhrase from web.config. This is the passphrase used on both ends (Identifix and iATN) to encrypt/decrypt the data being
        /// passed back and forth. Changes to this key need to be done over secure channels, and synchronized 
        /// rollout between iATN and Identifix. (Keep in mind it is likely that anyone using the system while
        /// a change like this is being rolled out may receive an error when decoding fails.)
        /// </summary>
        private static Byte[] PassPhraseKey
        {
            get
            {
                var passPhraseInList = new List<byte>();
                string[] encryptKeys = EncryptKey.Split(SplitCharacter);
                if (encryptKeys.Length != 0)
                {
                    string encryptKeyItem = string.Empty;
                    for (int i = 0; i < encryptKeys.Length; i++)
                    {
                        encryptKeyItem = encryptKeys[i].Trim();
                        if (!string.IsNullOrEmpty(encryptKeyItem))
                            passPhraseInList.Add(Convert.ToByte(encryptKeyItem, CultureInfo.CurrentCulture));
                    }
                    passPhrase = passPhraseInList.ToArray();
                }

                return passPhrase;
            }
        }

        public static string SHA256Hash(string text)
        {
            string hResult = string.Empty;
            using (var sha256 = SHA256.Create())
            {
                // Send a sample text to hash.  
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(text));
                // Get the hashed string.  
                hResult = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
            return hResult;
        }
        public static string AutoGenerateNewPassword(int length)
        {
            var r = new Random();
            var specialCharacters = new char[] { '!', '@', '#', '&', '*', '-', '$', '%', '?' };
            var randomSpecial = specialCharacters[r.Next(0, specialCharacters.Length)];
            var digits = new[] { '1', '2', '3', '4', '5', '6', '7', '8', '9' };
            var randomDigit = digits[r.Next(0, digits.Length)];

            byte[] rgb = new byte[length];
            RNGCryptoServiceProvider rngCrypt = new RNGCryptoServiceProvider();
            rngCrypt.GetBytes(rgb);
            var newPass = Convert.ToBase64String(rgb);

            var randomPositionNewPass = r.Next(0, newPass.Length);
            StringBuilder sbNewPass = new StringBuilder(newPass);
            sbNewPass[randomPositionNewPass] = randomSpecial;
            sbNewPass[randomPositionNewPass + 1] = randomDigit;

            return sbNewPass.ToString();
        }

        #endregion

        /// <summary>
        /// IsValidJson
        /// </summary>
        /// <param name="strInput"></param>
        /// <returns></returns>
        public static bool IsValidJson(string strInput)
        {
            strInput = strInput.Trim();
            if ((strInput.StartsWith("{") && strInput.EndsWith("}")) || //For object
                (strInput.StartsWith("[") && strInput.EndsWith("]"))) //For array
            {
                try
                {
                    var obj = JToken.Parse(strInput);
                    return true;
                }
                catch (JsonReaderException)
                {
                    return false;
                }
                catch (Exception)
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// IsValidJson
        /// </summary>
        /// <param name="strInput"></param>
        /// <returns></returns>
        public static string GetFullDomainUrl(HttpContext context)
        {
            return string.Format("{0}://{1}", context.Request.IsHttps ? "https" : "http", context.Request.Host);
        }

        /// <summary>
        /// GetPersonTypeFromIndexKey
        /// </summary>
        /// <param name="indexKey"></param>
        /// <returns></returns>
        public static PersonTypeMode GetPersonTypeFromIndexKey(string indexKey)
        {
            PersonTypeMode personType = PersonTypeMode.None;
            switch (indexKey)
            {
                case "customer":
                    personType = PersonTypeMode.Customer;
                    break;

                case "broker":
                    personType = PersonTypeMode.Broker;
                    break;

                case "cashprovider":
                    personType = PersonTypeMode.CashProvider;
                    break;

                case "desktopprovider":
                    personType = PersonTypeMode.DesktopProvider;
                    break;

                case "freightprovider":
                    personType = PersonTypeMode.FreightProvider;
                    break;

                case "mandant":
                    personType = PersonTypeMode.Mandant;
                    break;

                case "postprovider":
                    personType = PersonTypeMode.PostProvider;
                    break;

                case "principal":
                    personType = PersonTypeMode.Principal;
                    break;

                case "printprovider":
                    personType = PersonTypeMode.PrintProvider;
                    break;

                case "provider":
                    personType = PersonTypeMode.Provider;
                    break;

                case "scancenter":
                    personType = PersonTypeMode.ScanCenter;
                    break;

                case "serviceprovider":
                    personType = PersonTypeMode.ServiceProvider;
                    break;

                case "supplier":
                    personType = PersonTypeMode.Supplier;
                    break;

                case "warehouse":
                    personType = PersonTypeMode.Warehouse;
                    break;
            }
            return personType;
        }

        /// <summary>
        /// BuildTree
        /// </summary>
        /// <param name="source"></param>
        /// <returns></returns>
        public static IList<GlobalModule> BuildTree(this IEnumerable<GlobalModule> source)
        {
            var groups = source.GroupBy(i => i.IdSettingsGUIParent);

            var roots = groups.FirstOrDefault(g => g.Key.HasValue == false).ToList();

            if (roots.Count > 0)
            {
                var dict = groups.Where(g => g.Key.HasValue).ToDictionary(g => g.Key.Value, g => g.ToList());
                for (int i = 0; i < roots.Count; i++)
                    AddChildren(roots[i], dict);
            }

            return roots;
        }

        /// <summary>
        /// MappModelToData
        /// with Model and Data have same properties name
        /// just one difference on data, prefix with "B00"
        /// </summary>
        /// <param name="data"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        public static object MappModelToData(object data, object model, bool hasNotTableNameOfPrefix = false)
        {
            foreach (var parentProperty in model.GetType().GetProperties())
            {
                if (parentProperty.Attributes.GetType().FullName == (new IgnoreMapAttribute()).GetType().FullName) continue;
                var parentInstance = parentProperty.GetValue(model);
                if (parentInstance == null)
                    continue;
                foreach (var childProperty in parentInstance.GetType().GetProperties())
                {
                    var strQueryProperty = (hasNotTableNameOfPrefix == true) ?
                        childProperty.Name
                        : string.Format("B00{0}_{1}", parentProperty.Name, childProperty.Name);
                    var queryProperty = data.GetType().GetProperty(strQueryProperty);
                    if (queryProperty != null)
                    {
                        var value = childProperty.GetValue(parentInstance);
                        if (value == null)
                            continue;
                        if (value.GetType() == typeof(DateTime))
                            queryProperty.SetValue(data, ((DateTime)value).ToString("MM/dd/yyyy"));
                        else if (value.GetType() == typeof(bool))
                            queryProperty.SetValue(data, value.ToString().ToLower());
                        else if (value.GetType() == typeof(int))
                            queryProperty.SetValue(data, value.ToString().ToLower());
                        else if (value.GetType() == typeof(int?) && value != null)
                            queryProperty.SetValue(data, value.ToString().ToLower());
                        else
                        {
                            try
                            {
                                queryProperty.SetValue(data, value.ToString());
                            }
                            catch (Exception)
                            {
                                queryProperty.SetValue(data, "");
                            }
                        }
                    }
                }
            }
            return data;
        }

        /// <summary>
        /// MappModelToSimpleData
        /// with Model and Data have same properties name
        /// </summary>
        /// <param name="data"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        public static object MappModelToSimpleData(object data, object model)
        {
            foreach (var prop in model.GetType().GetProperties())
            {
                var queryProperty = data.GetType().GetProperty(prop.Name);
                if (queryProperty == null)
                    continue;
                var value = prop.GetValue(model);
                if (value == null)
                    continue;
                if (prop.GetType() == typeof(DateTime))
                    queryProperty.SetValue(data, ((DateTime)value).ToString("MM/dd/yyyy"));
                else if (prop.GetType() == typeof(bool))
                    queryProperty.SetValue(data, value.ToString().ToLower());
                else if (prop.GetType() == typeof(int))
                    queryProperty.SetValue(data, value.ToString().ToLower());
                else if (prop.GetType() == typeof(int?) && value != null)
                    queryProperty.SetValue(data, value.ToString().ToLower());
                else
                    queryProperty.SetValue(data, value);
            }
            return data;
        }

        private static void AddChildren(GlobalModule node, IDictionary<int, List<GlobalModule>> source)
        {
            if (source.ContainsKey(node.IdSettingsGUI))
            {
                node.Children = source[node.IdSettingsGUI];
                for (int i = 0; i < node.Children.Count; i++)
                    AddChildren(node.Children[i], source);
            }
            else
            {
                node.Children = new List<GlobalModule>();
            }
        }

        #region Text
        /// <summary>
        /// samuel -> Samuel
        /// julia -> Julia
        /// john smith -> John smith
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static string ToUppercaseFirst(this string s)
        {
            if (string.IsNullOrEmpty(s))
                return string.Empty;

            char[] a = s.ToCharArray();
            a[0] = char.ToUpper(a[0]);
            return new string(a);
        }

        /// <summary>
        /// FirstCharacterToLower
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string FirstCharacterToLower(string str)
        {
            if (string.IsNullOrEmpty(str) || char.IsLower(str, 0))
                return str;

            return char.ToLowerInvariant(str[0]) + str.Substring(1);
        }
        #endregion

        public static void CreateSaveDataWithArray(dynamic data, object model, string arrayName)
        {
            var modelValue = JsonConvert.SerializeObject(model, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            data.JSONText = string.Format(@"""{0}"":{1}", arrayName, modelValue);
            data.JSONText = "{" + data.JSONText + "}";
        }

        public static ExpandoObject ToExpandoObject(object obj)
        {
            IDictionary<string, object> expando = new ExpandoObject();

            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(obj.GetType()))
            {
                expando.Add(property.Name, property.GetValue(obj));
            }

            return (ExpandoObject)expando;
        }
        public static IDictionary<string, object> ToDictionary(object obj)
        {
            IDictionary<string, object> dic = new Dictionary<string, object>();

            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(obj.GetType()))
            {
                dic.Add(property.Name, property.GetValue(obj));
            }

            return dic;
        }

        public static string CreateJsonText(string key, object value, string startString = "{", string endString = "}")
        {
            var modelValue = JsonConvert.SerializeObject(value, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            var jsonText = string.Format(@"""{0}"":{1}", key, modelValue);
            jsonText = startString + jsonText + endString;
            return jsonText;
        }

        public static string GetStringValue(this IDictionary<string, object> data, string key)
        {
            try
            {
                return data[key] + string.Empty;
            }
            catch { return string.Empty; }
        }

        public static object GetValue(this IDictionary<string, object> data, string key)
        {
            try
            {
                return data[key];
            }
            catch { return null; }
        }

        public static IDictionary<string, object> GetValue(this IDictionary<string, IDictionary<string, object>> data, string key)
        {
            try
            {
                return data[key];
            }
            catch { }
            return null;
        }

        public static IList<string> ToListString(this IDictionary<string, object> data)
        {
            IList<string> ret = new List<string>();
            try
            {
                foreach (KeyValuePair<string, object> entry in data)
                {
                    ret.Add(entry.Value + string.Empty);
                }
            }
            catch { }
            return ret;
        }

        public static string[] SplitDouble(this double inputValue)
        {
            try
            {
                string s = inputValue.ToString("0.00", CultureInfo.InvariantCulture);
                string[] parts = s.Split('.');
                return parts;
            }
            catch { }
            return new string[2];
        }

        public static string[] SplitDouble(this double? inputValue)
        {
            if (inputValue == null) return new string[2];
            return SplitDouble(inputValue.Value);
        }

        public static string ToNumberString(this double inputValue)
        {
            try
            {
                return inputValue.ToString("#,##0.00", CultureInfo.InvariantCulture);
            }
            catch { }
            return "0";
        }

        public static string ToNumberString(this double? inputValue)
        {
            if (inputValue == null) return "0";
            return ToNumberString(inputValue.Value);
        }

        public static string CorrectBase64String(string base64String)
        {
            base64String = Regex.Replace(base64String, "^data:image\\/[a-zA-Z]+;base64,", string.Empty);
            return base64String;
        }

        public static Dictionary<string, object> ParseQueryStringToDictionary(string queryString)
        {
            var model = new Dictionary<string, object>();
            try
            {
                NameValueCollection nv = HttpUtility.ParseQueryString(queryString);
                foreach (string key in nv)
                {
                    model[key] = nv[key];
                }
            }
            catch { }
            return model;
        }

        public static string GetPlatFormPath(AppSettings appSettings)
        {
            string path = appSettings.Platform.Equals(EumPlatform.Linux.ToString()) ? "/" : "\\";
            return path;
        }


        public static string RemoveSpecialCharactersCurrency(string input)
        {
            input = input.Replace(",", "").Replace(".", "").Replace("'", "");
            return input;
        }
    }
}
