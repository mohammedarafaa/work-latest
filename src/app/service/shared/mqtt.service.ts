import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { IMqttMessage, MqttService as NgxMqttService } from 'ngx-mqtt';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private messageSubject = new Subject<any>();
  private connectionStatus = new BehaviorSubject<string>('disconnected');
  private topicSubscriptions: { [topic: string]: Subscription } = {}; // Track topic subscriptions

  constructor(private ngxMqttService: NgxMqttService) {
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.ngxMqttService.onConnect.subscribe(() => {
      // console.log('Connected to MQTT broker');
      this.connectionStatus.next('connected');
    });

    this.ngxMqttService.onError.subscribe((error:any) => {
      // console.error('MQTT Connection Error:', error);
      this.connectionStatus.next('error');
    });

    this.ngxMqttService.onClose.subscribe(() => {
      // console.log('MQTT connection closed');
      this.connectionStatus.next('disconnected');
    });
  }

  connect(): void {
    this.ngxMqttService.connect();
  }

  subscribeToTopics(topic: string) {
    if (!this.topicSubscriptions[topic]) {
      this.topicSubscriptions[topic] = this.ngxMqttService.observe(topic).subscribe((message: IMqttMessage) => {
        try {
          // console.log('Received message from topic:', topic);
          const payload = JSON.parse(message.payload.toString());
          this.messageSubject.next({ topic: message.topic, payload });
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      });
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<string> {
    return this.connectionStatus.asObservable();
  }

  disconnect() {
    const currentStatus = this.connectionStatus.getValue();
    if (currentStatus === 'connected') {
      // Unsubscribe from all topics
      Object.keys(this.topicSubscriptions).forEach((topic) => {
        this.topicSubscriptions[topic].unsubscribe();
        delete this.topicSubscriptions[topic];
      });

      this.ngxMqttService.disconnect();
    } else {
      console.log('MQTT client is not connected, no need to disconnect.');
    }
  }

}
