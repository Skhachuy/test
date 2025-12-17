import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillService } from '../../services/bill.service';
import { Bill, Payment, AddPaymentRequest, Tenant } from '../../../../core/models/bill.model';
import { MessageService, ConfirmationService } from 'primeng/api';

interface PaymentMethodOption {
  label: string;
  value: string;
}

interface TenantOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-bill-management',
  templateUrl: './bill-management.component.html',
  styleUrls: ['./bill-management.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BillManagementComponent implements OnInit {
  bills: Bill[] = [];
  selectedBill: Bill | null = null;
  loading: boolean = false;
  
  // Dialogs
  showBillForm: boolean = false;
  showDetailDialog: boolean = false;
  showAddPaymentDialog: boolean = false;
  
  // Forms
  billToEdit: Bill | null = null;
  addPaymentForm!: FormGroup;
  submittingPayment: boolean = false;
  
  // Payment method options
  paymentMethodOptions: PaymentMethodOption[] = [
    { label: 'Tiền mặt', value: 'cash' },
    { label: 'Chuyển khoản', value: 'bank_transfer' },
    { label: 'Momo', value: 'momo' },
    { label: 'ZaloPay', value: 'zalopay' },
    { label: 'VNPay', value: 'vnpay' }
  ];
  
  // Tenant options (would be loaded from API in real implementation)
  tenantOptions: TenantOption[] = [];
  
  // Pagination
  page: number = 1;
  limit: number = 10;
  totalRecords: number = 0;

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initAddPaymentForm();
    this.loadBills();
  }

  /**
   * Initialize add payment form
   */
  private initAddPaymentForm(): void {
    this.addPaymentForm = this.fb.group({
      tenantId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      method: ['cash', Validators.required],
      note: ['']
    });
  }

  /**
   * Load bills
   */
  loadBills(): void {
    this.loading = true;
    this.billService.getBills(this.page, this.limit).subscribe({
      next: (response) => {
        this.bills = response.data;
        this.totalRecords = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bills:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách hóa đơn'
        });
        this.loading = false;
      }
    });
  }

  /**
   * View bill details
   */
  viewBillDetails(bill: Bill): void {
    this.selectedBill = bill;
    this.loadTenantOptions(bill);
    this.showDetailDialog = true;
  }

  /**
   * Load tenant options for the bill
   */
  private loadTenantOptions(bill: Bill): void {
    // In a real implementation, this would load tenants associated with the room
    // For now, we'll extract unique tenants from existing payments
    const uniqueTenants = new Map<string, TenantOption>();
    
    bill.payments?.forEach(payment => {
      if (payment.tenant) {
        uniqueTenants.set(payment.tenant.id, {
          id: payment.tenant.id,
          name: payment.tenant.name
        });
      }
    });
    
    this.tenantOptions = Array.from(uniqueTenants.values());
  }

  /**
   * Show add payment dialog
   */
  showAddPayment(): void {
    if (!this.selectedBill) return;
    
    this.addPaymentForm.reset({
      method: 'cash',
      amount: 0,
      note: ''
    });
    
    this.showAddPaymentDialog = true;
  }

  /**
   * Close add payment dialog
   */
  closeAddPaymentDialog(): void {
    this.showAddPaymentDialog = false;
    this.addPaymentForm.reset();
  }

  /**
   * Submit payment
   */
  submitPayment(): void {
    if (this.addPaymentForm.invalid || !this.selectedBill) {
      this.addPaymentForm.markAllAsTouched();
      return;
    }

    this.submittingPayment = true;
    const paymentData: AddPaymentRequest = this.addPaymentForm.value;

    this.billService.addPaymentToBill(this.selectedBill.id, paymentData).subscribe({
      next: (updatedBill) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Thêm thanh toán thành công'
        });
        
        // Update selected bill and bills list
        this.selectedBill = updatedBill;
        this.updateBillInList(updatedBill);
        
        this.closeAddPaymentDialog();
        this.submittingPayment = false;
      },
      error: (error) => {
        console.error('Error adding payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.error?.message || 'Không thể thêm thanh toán'
        });
        this.submittingPayment = false;
      }
    });
  }

  /**
   * Delete payment
   */
  deletePayment(payment: Payment): void {
    if (!this.selectedBill) return;

    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa thanh toán này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.billService.deletePayment(this.selectedBill!.id, payment.id).subscribe({
          next: (updatedBill) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Xóa thanh toán thành công'
            });
            
            // Update selected bill and bills list
            this.selectedBill = updatedBill;
            this.updateBillInList(updatedBill);
          },
          error: (error) => {
            console.error('Error deleting payment:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: error.error?.message || 'Không thể xóa thanh toán'
            });
          }
        });
      }
    });
  }

  /**
   * Update bill in list after changes
   */
  private updateBillInList(updatedBill: Bill): void {
    const index = this.bills.findIndex(b => b.id === updatedBill.id);
    if (index !== -1) {
      this.bills[index] = updatedBill;
    }
  }

  /**
   * Create new bill
   */
  createBill(): void {
    this.billToEdit = null;
    this.showBillForm = true;
  }

  /**
   * Edit bill
   */
  editBill(bill: Bill): void {
    this.billToEdit = bill;
    this.showBillForm = true;
  }

  /**
   * Handle bill save
   */
  onBillSaved(bill: Bill): void {
    this.loadBills();
    this.showBillForm = false;
  }

  /**
   * Get payment method label
   */
  getPaymentMethodLabel(method: string): string {
    const option = this.paymentMethodOptions.find(opt => opt.value === method);
    return option?.label || method;
  }

  /**
   * Get payment method severity for badge color
   */
  getPaymentMethodSeverity(method: string): string {
    switch (method) {
      case 'cash':
        return 'success';
      case 'bank_transfer':
        return 'info';
      case 'momo':
        return 'warning';
      case 'zalopay':
        return 'primary';
      case 'vnpay':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get status severity for badge color
   */
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'unpaid':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'partial':
        return 'Thanh toán một phần';
      case 'unpaid':
        return 'Chưa thanh toán';
      default:
        return status;
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format date time
   */
  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('vi-VN');
  }

  /**
   * Format date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.loadBills();
  }
}
