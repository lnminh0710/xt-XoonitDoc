using DMS.Constants;

namespace DMS.Models.Authenticate
{
    public class HandleAccessTokenModel
    {
        public UserFromService UserFromDb { get; set; }
        public User UserClient { get; set; }
        public TargetToken TokenTarget { get; set; }
        public UserFromService UserFromService { get; set; }
        public UserToken UserToken { get; set; }
    }
}
