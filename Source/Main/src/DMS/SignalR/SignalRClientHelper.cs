using System;
using System.Threading.Tasks;
using log4net;
using System.Threading;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using DMS.Utils;
using Microsoft.AspNetCore.Http;

namespace XenaSignalR
{
    /*
     https://stackoverflow.com/questions/35609141/how-can-i-ignore-https-certificate-warnings-in-the-c-sharp-signalr-client/35628016
     https://stackoverflow.com/questions/44433067/signalr-could-not-establish-trust-relationship-for-the-ssl-tls-secure-channel
     https://github.com/aspnet/SignalR/issues/1389
     https://github.com/aspnet/SignalR/issues/3145
     */

    public delegate void ReceiveMessageCalled(SignalRMessageModel model);

    public interface ISignalRClientHelper
    {
        void Connect();
        void Disconnect();
        Task SendMessage(SignalRMessageModel model, bool receiveWithType = true);
        void SendMessageUser(string idApplicationOwner, SignalRMessageModel model);
        void SendMessageGroup(string groupName, SignalRMessageModel model);
        event ReceiveMessageCalled OnReceiveMessageCalled;

        bool IsEstablished();
    }

    public class SignalRClientHelper : ISignalRClientHelper
    {
        private static log4net.ILog _log = log4net.LogManager.GetLogger(Assembly.GetEntryAssembly(), "SignalR");

        /// <summary>
        /// Endpoint + Hub
        /// </summary>
        private string _notificationUrl = string.Empty;
        private string _connectType = string.Empty;

        /// <summary>
        /// Current instantiated client
        /// </summary>
        private HubConnection _connection { get; set; }
        public event ReceiveMessageCalled OnReceiveMessageCalled;
        private bool _connectionIsEstablished;
        private bool _isStartingConnection;
        public bool _forceDisconnect = false;
        private CancellationToken _cancellationToken;
        private const int maximumRetryConnecting = 10000;//retry 10000 times
        private int numofRetryConnecting = 0;

        public SignalRClientHelper(IHttpContextAccessor httpContextAccessor, IAppServerSetting appServerSetting)
        {
            try
            {
                var notifyUrl = appServerSetting.ServerConfig.ServerSetting.SignalRApiUrl;
                var groupName = appServerSetting.ServerConfig.Domain;

                if (httpContextAccessor != null && httpContextAccessor.HttpContext != null && httpContextAccessor.HttpContext.Request != null && httpContextAccessor.HttpContext.Request.Host != null)
                {
                    groupName = httpContextAccessor.HttpContext.Request.Host.Value;
                }

                _notificationUrl = $"{notifyUrl}?groupName={groupName}&userName=api_web&env=api_web";

                _log.Error($"Init SignalRClient with url: {_notificationUrl}");
                if (!string.IsNullOrEmpty(_notificationUrl))
                {
                    //SignalR Client will be constructed when web start. Because it is injected in CommonController and the GetPublicSetting method will be called when web start
                    //If dont' put in thread, if dont't connect -> call forever -> web die with HttpCode: 502.3 bad gate way
                    Task.Run(() =>
                    {
                        Connect();
                    });
                }
            }
            catch (Exception ex)
            {
                _log.Error("Init SignalRClient", ex);
            }
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public SignalRClientHelper(string notificationUrl, ILog log, CancellationToken cancellationToken)
        {
            _log = log;
            _notificationUrl = notificationUrl;
            _cancellationToken = cancellationToken;
        }

        public SignalRClientHelper(string notificationUrl)
        {
            _notificationUrl = notificationUrl;
        }

        #region Private
        private async Task OpenSignalRConnection()
        {
            await Task.Run(async () =>
            {
                try
                {
                    #region Sleep more if exceed the number of retry
                    if (numofRetryConnecting > maximumRetryConnecting)
                    {
                        _connectionIsEstablished = false;
                        _isStartingConnection = false;
                        LogMessage("OpenSignalRConnection: sleep more if exceed the number of retry");
                        int delay = 2 * 1000 * 60;//in minutes: -> 2 minutes
                        await Task.Delay(delay, _cancellationToken);

                        numofRetryConnecting = 0;
                    }
                    #endregion

                    if (_isStartingConnection)
                    {
                        return;
                    }

                    _isStartingConnection = true;
                    LogMessage("Starting SignalR connection");

                    _connection = new HubConnectionBuilder()
                                    .WithUrl(_notificationUrl)
                                    .AddMessagePackProtocol()
                                    .Build();

                    /*
                     - Timeout for server activity. If the server hasn't sent a message in this interval, the client considers the server disconnected and triggers the Closed event (onclose in JavaScript). 
                     - This value must be large enough for a ping message to be sent from the server and received by the client within the timeout interval. 
                     - The recommended value is a number at least double the server's KeepAliveInterval value to allow time for pings to arrive.
                     */
                    _connection.ServerTimeout = TimeSpan.FromMinutes(120); // 120 minutes

                    /*
                    var receiveName = "ReceiveMessage" + _connectType;
                    _connection.On<SignalRMessageModel>(receiveName, OnReceiveMessage);
                    LogMessage($" + ReceiveName: {receiveName}");
                    */

                    _connection.Closed += SignalRConnection_Closed;

                    await _connection.StartAsync(_cancellationToken);

                    _isStartingConnection = false;
                    _connectionIsEstablished = true;
                    numofRetryConnecting = 0;
                    LogMessage($"SignalR connection established: {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}");
                }
                catch (TaskCanceledException ex)
                {
                    LogMessage($"OpenSignalRConnection-TaskCanceledException: {ex}");
                }
                catch (Exception ex)
                {
                    numofRetryConnecting++;
                    LogMessage($"OpenSignalRConnection-Exception: {ex}");
                    await TryOpenSignalRConnection();
                }
                finally
                {
                    await Task.CompletedTask;
                }
            }, _cancellationToken);
        }

        private async Task SignalRConnection_Closed(Exception ex)
        {
            if (ex != null)
            {
                LogMessage($"SignalRConnection_Closed-Exception: {ex}");
            }

            await TryOpenSignalRConnection();
        }

        private async Task TryOpenSignalRConnection()
        {
            try
            {
                if (_connection == null) return;

                _isStartingConnection = false;
                _connectionIsEstablished = false;
                _connection.Closed -= SignalRConnection_Closed;

                if (_forceDisconnect)
                {
                    LogMessage("Force Disconnect");
                }
                else
                {
                    LogMessage($"Trying to connect to SignalR server: {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}");
                    await Task.Delay(10000, _cancellationToken);
                    await OpenSignalRConnection();
                }
            }
            catch (Exception ex)
            {
                LogMessage($"TryOpenSignalRConnection-Exception: {ex}");
            }
            finally
            {
                await Task.CompletedTask;
            }
        }

        private void OnReceiveMessage(SignalRMessageModel model)
        {
            // Fire the event
            OnReceiveMessageCalled?.Invoke(model);
        }
        #endregion

        public void Connect()
        {
            try
            {
                //  _connectType = type;

                if (string.IsNullOrEmpty(_notificationUrl)) return;

                LogMessage("SignalR - Connect: " + _connectType);

                _forceDisconnect = false;
                _isStartingConnection = false;
                _connectionIsEstablished = false;

                OpenSignalRConnection().Wait();
            }
            catch (Exception ex)
            {
                LogMessage($"Connect-Exception: {ex}");
            }
        }

        public void Disconnect()
        {
            try
            {
                LogMessage("SignalR - Disconnect");

                _forceDisconnect = true;
                _isStartingConnection = false;
                _connectionIsEstablished = false;
                _connection.StopAsync().Wait();
            }
            catch (Exception ex)
            {
                LogMessage($"Disconnect-Exception: {ex}");
            }
        }

        public async Task SendMessage(SignalRMessageModel model, bool receiveWithType = true)
        {
            try
            {
                if (_isStartingConnection || !_connectionIsEstablished)
                {
                    LogConnectionState("SendMessage");
                    return;
                }

                await _connection.InvokeAsync("SendMessage" + (receiveWithType ? model.Type : ""), model, _cancellationToken);
            }
            catch (Exception ex)
            {
                LogMessage($"SendMessage-Exception: {ex}");
            }
            finally
            {
                await Task.CompletedTask;
            }
        }

        public async void SendMessageUser(string idApplicationOwner, SignalRMessageModel model)
        {
            try
            {
                if (_isStartingConnection || !_connectionIsEstablished)
                {
                    LogConnectionState("SendMessageUser");
                    return;
                }

                await _connection.InvokeAsync("SendMessage" + model.Type, idApplicationOwner, model, _cancellationToken);
            }
            catch (Exception ex)
            {
                LogMessage($"SendMessage-Exception: {ex}");
            }
            finally
            {
                await Task.CompletedTask;
            }
        }

        public async void SendMessageGroup(string groupName, SignalRMessageModel model)
        {
            try
            {
                if (_isStartingConnection || !_connectionIsEstablished)
                {
                    LogConnectionState("SendMessageGroup");
                    return;
                }

                await _connection.InvokeAsync("SendMessage" + model.Type, groupName, model, _cancellationToken);
            }
            catch (Exception ex)
            {
                LogMessage($"SendMessage-Exception: {ex}");
            }
            finally
            {
                await Task.CompletedTask;
            }
        }

        public void LogMessage(object message)
        {
#if DEBUG
            Console.WriteLine(message);
#endif

            if (message is Exception)
                _log.Error(message);
            else
                _log.Info(message);
        }

        public bool IsEstablished()
        {
            return _connectionIsEstablished;
        }

        private void LogConnectionState(string prefix = "")
        {
            LogMessage($"{prefix}: is starting connection: {_isStartingConnection}, is established: {_connectionIsEstablished}");
        }
    }
}
