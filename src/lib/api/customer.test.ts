import { describe, expect, it, vi, beforeEach } from "vitest";
import { customerApi } from "./customer";
import { apiClient } from "./client";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("customerApi (Doc 25 Customer Endpoints Client)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Bills & VTU", () => {
    it("getBillCategories fetches and extracts bill categories", async () => {
      const mockCategories = [
        { code: "airtime", name: "Airtime Topup" },
        { code: "data", name: "Mobile Data" },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockCategories, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getBillCategories();
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/categories");
      expect(result).toEqual(mockCategories);
    });

    it("getBillServices fetches services with optional category query param", async () => {
      const mockServices = [
        { service_code: "MTN_DATA", name: "MTN Mobile Data", category: "data" },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockServices, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getBillServices("data");
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/services", {
        params: { category: "data" },
      });
      expect(result).toEqual(mockServices);
    });

    it("getDataBundles fetches bundle packages for a given service code", async () => {
      const mockBundles = [
        { code: "112381", name: "MTN 1GB Data Plan (30 Days)", amount: 750 },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockBundles, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getDataBundles("MTN_DATA");
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/data-bundles", {
        params: { service_code: "MTN_DATA" },
      });
      expect(result).toEqual(mockBundles);
    });

    it("validateCustomerIdentifier posts customer identifier for validation", async () => {
      const mockValidation = {
        customer_name: "JOHN DOE",
        customer_identifier: "0100234567",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockValidation, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.validateCustomerIdentifier({
        service_code: "IKEDC",
        customer_identifier: "0100234567",
      });
      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/bills/validate", {
        service_code: "IKEDC",
        customer_identifier: "0100234567",
      });
      expect(result).toEqual(mockValidation);
    });

    it("payBill executes bill payment with optional idempotency key", async () => {
      const mockOrder = {
        id: "01JCEXAMPLEBILLORDERULID01",
        reference: "BIL-8F92A0E31C",
        provider_reference: "X8BSN",
        category: "data",
        service_code: "MTN_DATA",
        service_name: "MTN Mobile Data",
        package_code: "112381",
        customer_identifier: "08060671945",
        customer_name: "John Doe",
        amount: 75000,
        amount_formatted: "750.00",
        face_amount: 75000,
        face_amount_formatted: "750.00",
        discount_amount: 0,
        currency: "NGN" as const,
        status: "completed" as const,
        token: null,
        metadata: {},
        processed_at: "2026-11-16T18:30:00Z",
        created_at: "2026-11-16T18:29:58Z",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockOrder, meta: {} },
        status: 201,
        headers: new Headers(),
      });

      const payload = {
        service_code: "MTN_DATA",
        service_name: "MTN Mobile Data",
        category: "data",
        customer_identifier: "08060671945",
        amount: 75000,
      };

      const result = await customerApi.payBill(payload, "idem-key-1234");
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/bills/pay",
        payload,
        { headers: { "Idempotency-Key": "idem-key-1234" } }
      );
      expect(result).toEqual(mockOrder);
    });

    it("getBillHistory fetches paginated bill purchase transactions", async () => {
      const mockPaginated = {
        data: [
          {
            id: "01JCEXAMPLEBILLORDERULID01",
            reference: "BIL-8F92A0E31C",
            service_code: "MTN_DATA",
            service_name: "MTN Mobile Data",
            category: "data",
            customer_identifier: "08060671945",
            amount: 75000,
            amount_formatted: "750.00",
            status: "completed" as const,
            token: null,
            created_at: "2026-11-16T18:29:58Z",
          },
        ],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockPaginated,
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getBillHistory({ category: "data" });
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/history", {
        params: { category: "data" },
      });
      expect(result).toEqual(mockPaginated);
    });

    it("getBillOrder fetches single bill details by reference", async () => {
      const mockOrder = {
        id: "01JCEXAMPLEBILLORDERULID01",
        reference: "BIL-8F92A0E31C",
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockOrder, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getBillOrder("BIL-8F92A0E31C");
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/BIL-8F92A0E31C");
      expect(result).toEqual(mockOrder);
    });
  });

  describe("Wallet & Funding", () => {
    it("getWallet fetches customer wallet balance", async () => {
      const mockWallet = {
        id: "01JCEXAMPLEWALLETULID01",
        currency: "NGN" as const,
        balance: 250000,
        balance_formatted: "2500.00",
        created_at: "2026-11-14T12:00:00Z",
        updated_at: "2026-11-16T18:30:00Z",
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockWallet, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getWallet();
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/wallet");
      expect(result).toEqual(mockWallet);
    });

    it("initiateFunding sends funding initiation request", async () => {
      const mockFunding = {
        id: "01JCEXAMPLEFUNDINGULID01",
        reference: "KORAK-FUND-8A9B1C2D3E4F",
        provider: "finitypay",
        amount: 500000,
        amount_formatted: "5000.00",
        currency: "NGN" as const,
        status: "pending" as const,
        checkout_url: "https://checkout.cofinance.ng/pay/pay_01JX",
        processed_at: null,
        created_at: "2026-11-16T18:35:00Z",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockFunding, meta: {} },
        status: 201,
        headers: new Headers(),
      });

      const payload = {
        amount: 500000,
        redirect_url: "http://localhost:3000/wallet?status=callback",
      };
      const result = await customerApi.initiateFunding(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/wallet/fund", payload);
      expect(result).toEqual(mockFunding);
    });

    it("getFundingStatus fetches status of funding session", async () => {
      const mockFunding = {
        id: "01JCEXAMPLEFUNDINGULID01",
        reference: "KORAK-FUND-8A9B1C2D3E4F",
        status: "success" as const,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockFunding, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getFundingStatus("KORAK-FUND-8A9B1C2D3E4F");
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/wallet/fund/KORAK-FUND-8A9B1C2D3E4F"
      );
      expect(result).toEqual(mockFunding);
    });

    it("getTransactions fetches paginated ledger transactions", async () => {
      const mockTransactions = {
        data: [
          {
            id: "01JCLEDGERENTRYULID01",
            direction: "debit" as const,
            type: "order_debit" as const,
            amount: 75000,
            amount_formatted: "750.00",
            balance_after: 250000,
            balance_after_formatted: "2500.00",
            currency: "NGN" as const,
            reference: "BIL-8F92A0E31C",
            description: "VTU/Bill Purchase: MTN Mobile Data",
            metadata: null,
            created_at: "2026-11-16T18:29:58Z",
          },
        ],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockTransactions,
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getTransactions({ direction: "debit" });
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/wallet/transactions", {
        params: { direction: "debit" },
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("Notifications", () => {
    it("getNotifications fetches paginated notification feed", async () => {
      const mockNotifications = {
        data: [
          {
            id: "9d8e7f6a-5b4c-3a2b-1a0f-9e8d7c6b5a4f",
            type: "WalletFundedNotification",
            title: "Wallet Funded",
            message: "Your wallet has been credited with ₦5,000.00.",
            category: "wallet",
            data: {},
            read_at: null,
            created_at: "2026-11-16T17:45:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockNotifications,
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getNotifications({ unread: true });
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/notifications", {
        params: { unread: true },
      });
      expect(result).toEqual(mockNotifications);
    });

    it("getUnreadNotificationsCount fetches unread badge count", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: { unread_count: 5 }, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const count = await customerApi.getUnreadNotificationsCount();
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/notifications/unread-count"
      );
      expect(count).toBe(5);
    });

    it("markNotificationAsRead updates notification read status", async () => {
      const updated = {
        id: "note-123",
        read_at: "2026-11-16T18:00:00Z",
      };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { data: updated, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.markNotificationAsRead("note-123", true);
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/v1/notifications/note-123",
        { read: true }
      );
      expect(result).toEqual(updated);
    });

    it("markAllNotificationsAsRead calls read-all endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: { message: "All notifications marked as read." } },
        status: 200,
        headers: new Headers(),
      });

      await customerApi.markAllNotificationsAsRead();
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/notifications/read-all"
      );
    });
  });

  describe("Profile & Security", () => {
    it("getProfile fetches customer profile", async () => {
      const mockProfile = {
        id: "01JCCUSTOMERULID01",
        username: "johndoe",
        email: "johndoe@example.com",
        email_verified_at: "2026-11-14T10:00:00Z",
        created_at: "2026-11-14T09:30:00Z",
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockProfile, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getProfile();
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/profile");
      expect(result).toEqual(mockProfile);
    });

    it("updateProfile sends profile update patch", async () => {
      const updated = {
        id: "01JCCUSTOMERULID01",
        username: "newusername",
        email: "newemail@example.com",
        email_verified_at: null,
        created_at: "2026-11-14T09:30:00Z",
      };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { data: updated, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.updateProfile({
        username: "newusername",
      });
      expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/profile", {
        username: "newusername",
      });
      expect(result).toEqual(updated);
    });

    it("changePassword sends password change put request", async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { data: { message: "Password changed successfully." } },
        status: 200,
        headers: new Headers(),
      });

      const payload = {
        current_password: "OldPassword123!",
        password: "NewPassword456!",
        password_confirmation: "NewPassword456!",
      };
      await customerApi.changePassword(payload);
      expect(apiClient.put).toHaveBeenCalledWith(
        "/api/v1/profile/password",
        payload
      );
    });

    it("getSessions fetches active customer sessions", async () => {
      const mockSessions = [
        {
          id: "hashed-session-id",
          ip_address: "127.0.0.1",
          user_agent: "Chrome",
          is_current: true,
          last_activity: "2026-11-16T18:40:00Z",
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockSessions, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getSessions();
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/profile/sessions");
      expect(result).toEqual(mockSessions);
    });

    it("revokeSession revokes a specific session", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { data: { message: "Session revoked." } },
        status: 200,
        headers: new Headers(),
      });

      await customerApi.revokeSession("session-123");
      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/v1/profile/sessions/session-123"
      );
    });

    it("revokeOtherSessions revokes all other sessions", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { data: { message: "Other sessions revoked." } },
        status: 200,
        headers: new Headers(),
      });

      await customerApi.revokeOtherSessions();
      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/v1/profile/sessions/other"
      );
    });

    it("getSecurityActivity fetches customer audit log", async () => {
      const mockActivities = [
        {
          id: "104",
          event: "auth.password_changed",
          ip_address: "127.0.0.1",
          user_agent: "Chrome",
          metadata: {},
          occurred_at: "2026-11-16T18:32:00Z",
          created_at: null,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockActivities, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getSecurityActivity();
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/profile/security-activity"
      );
      expect(result).toEqual(mockActivities);
    });

    it("getTrustedDevices fetches customer trusted devices", async () => {
      const mockDevices = [
        {
          id: "01JCTRUSTEDDEVICEULID01",
          device_name: "Chrome on Windows",
          ip_address: "102.89.44.12",
          last_used_at: "2026-11-16T18:00:00Z",
          created_at: "2026-11-10T14:20:00Z",
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockDevices, meta: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await customerApi.getTrustedDevices();
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/auth/devices");
      expect(result).toEqual(mockDevices);
    });

    it("revokeTrustedDevice revokes a specific trusted device", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { data: { message: "Trusted device revoked." } },
        status: 200,
        headers: new Headers(),
      });

      await customerApi.revokeTrustedDevice("01JCTRUSTEDDEVICEULID01");
      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/v1/auth/devices/01JCTRUSTEDDEVICEULID01"
      );
    });

    it("revokeAllTrustedDevices revokes all trusted devices", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { data: { message: "All trusted devices revoked." } },
        status: 200,
        headers: new Headers(),
      });

      await customerApi.revokeAllTrustedDevices();
      expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/auth/devices");
    });
  });
});
