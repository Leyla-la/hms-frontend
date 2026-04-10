# Notification backend (Spring Boot - minimal)

This short guide shows a common Spring setup (STOMP over WebSocket) to publish notifications produced by backend services.

1) WebSocket config

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic", "/queue");
    config.setApplicationDestinationPrefixes("/app");
  }
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/notification-ws").setAllowedOrigins("*").withSockJS();
  }
}

2) Publishing from NotificationMS

@Autowired
private SimpMessagingTemplate messagingTemplate;

public void publishToUser(String userId, NotificationDTO n) {
  messagingTemplate.convertAndSend("/topic/user." + userId, n);
}

public void publishToRole(String role, NotificationDTO n) {
  messagingTemplate.convertAndSend("/topic/role." + role, n);
}

3) Notes
- Use authentication interceptor to validate token on subscribe/connect and map principal to userId/roles.
- For large role-level broadcasts consider messaging bridge (Kafka -> NotificationMS -> WebSocket) and rate-limit or partition.
- Provide /notifications REST endpoints and an SSE endpoint `/notifications/stream` if you need SSE fallback.

