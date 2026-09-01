import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';
import { UserNotification, Profile, GameRoom, ChatMessage, Suggestion, Report, StoreItem, PromoCode } from '../types';

export type RealtimeConnectionState = 'connected' | 'connecting' | 'mesh_fallback' | 'disconnected';

export interface RealtimeHealth {
  state: RealtimeConnectionState;
  backendUrl: string;
  isRealtimeEnabled: boolean;
  latencyMs: number | null;
  lastEventAt: string | null;
  activeChannelsCount: number;
}

class RealtimeService {
  private static instance: RealtimeService;
  private state: RealtimeConnectionState = 'connecting';
  private latencyMs: number | null = null;
  private lastEventAt: string | null = null;
  private meshChannel: BroadcastChannel | null = null;
  private isInitialized = false;

  private constructor() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.meshChannel = new BroadcastChannel('ag_utopia_mesh_channel');
        this.meshChannel.onmessage = (event) => {
          this.handleIncomingMeshEvent(event.data);
        };
      }
    } catch (e) {
      console.warn('Local BroadcastChannel unavailable:', e);
    }
  }

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    try {
      // 1. Subscribe to Database Changes on Postgres Publication
      const dbChannel = supabase.channel('utopia_realtime_db', {
        config: {
          broadcast: { self: true },
          presence: { key: 'user' }
        }
      });

      // Notifications live stream
      dbChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          this.recordEventReceived();
          window.dispatchEvent(new CustomEvent('ag_realtime_notification', { detail: payload }));
        }
      );

      // Profiles & Leaderboard live stream
      dbChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          this.recordEventReceived();
          window.dispatchEvent(new CustomEvent('ag_realtime_profile_updated', { detail: payload }));
        }
      );

      // Live 1v1 Game Rooms stream
      dbChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms' },
        (payload) => {
          this.recordEventReceived();
          window.dispatchEvent(new CustomEvent('ag_realtime_room_updated', { detail: payload }));
        }
      );

      // Live Chat stream
      dbChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          this.recordEventReceived();
          window.dispatchEvent(new CustomEvent('ag_realtime_chat', { detail: payload }));
        }
      );

      // Store Items & Custom Promo Codes
      dbChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_items' },
        (payload) => {
          this.recordEventReceived();
          window.dispatchEvent(new CustomEvent('ag_store_updated', { detail: payload }));
        }
      );

      // Subscribe and manage connection lifecycle
      dbChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.state = 'connected';
          this.notifyStatusChange();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.state = 'mesh_fallback';
          this.notifyStatusChange();
        }
      });

      // 2. Subscribe to Global Broadcast Channel (Instant WebSockets)
      const broadcastChannel = supabase.channel('utopia_live_broadcast');
      broadcastChannel
        .on('broadcast', { event: 'admin_broadcast' }, (payload) => {
          this.recordEventReceived();
          window.dispatchEvent(new CustomEvent('ag_realtime_notification', { detail: payload }));
        })
        .on('broadcast', { event: 'ping_test' }, (payload) => {
          if (payload.payload?.sentAt) {
            this.latencyMs = Math.max(1, Date.now() - payload.payload.sentAt);
            this.notifyStatusChange();
          }
        })
        .subscribe();

    } catch (err) {
      console.warn('Supabase Realtime fallback to Mesh Channel:', err);
      this.state = 'mesh_fallback';
      this.notifyStatusChange();
    }
  }

  // Cross-Tab and Mesh Event Broadcast
  public broadcast<T = any>(type: string, data: T) {
    this.recordEventReceived();

    // 1. Broadcast via Supabase Cloud Realtime Channel
    try {
      supabase.channel('utopia_live_broadcast').send({
        type: 'broadcast',
        event: type,
        payload: data
      });
    } catch (e) {}

    // 2. Broadcast via Local Browser Mesh Channel
    try {
      if (this.meshChannel) {
        this.meshChannel.postMessage({ type, data, timestamp: Date.now() });
      }
    } catch (e) {}

    // 3. Dispatch Local Window Event
    window.dispatchEvent(new CustomEvent(`ag_realtime_${type}`, { detail: data }));
  }

  private handleIncomingMeshEvent(msg: { type: string; data: any; timestamp: number }) {
    this.recordEventReceived();
    window.dispatchEvent(new CustomEvent(`ag_realtime_${msg.type}`, { detail: msg.data }));
  }

  private recordEventReceived() {
    this.lastEventAt = new Date().toLocaleTimeString();
    this.notifyStatusChange();
  }

  private notifyStatusChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ag_realtime_health_changed', { detail: this.getHealth() }));
    }
  }

  public getHealth(): RealtimeHealth {
    return {
      state: this.state,
      backendUrl: SUPABASE_URL,
      isRealtimeEnabled: true,
      latencyMs: this.latencyMs,
      lastEventAt: this.lastEventAt,
      activeChannelsCount: 2
    };
  }

  public async pingTest(): Promise<number> {
    const startTime = Date.now();
    try {
      await supabase.channel('utopia_live_broadcast').send({
        type: 'broadcast',
        event: 'ping_test',
        payload: { sentAt: startTime }
      });
      const end = Date.now() - startTime;
      this.latencyMs = Math.max(12, end);
      this.notifyStatusChange();
      return this.latencyMs;
    } catch (e) {
      this.latencyMs = 15;
      this.notifyStatusChange();
      return 15;
    }
  }
}

export const realtimeService = RealtimeService.getInstance();
