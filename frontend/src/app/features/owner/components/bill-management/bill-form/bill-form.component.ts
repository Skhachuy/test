import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { BillService } from '../../../services/bill.service';
import { Room, Bill } from '../../../../../core/models/bill.model';
import { MessageService } from 'primeng/api';

interface RoomOption {
  label: string;
  value: string;
  data: Room;
}

@Component({
  selector: 'app-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss']
})
export class BillFormComponent implements OnInit {
  @Input() bill: Bill | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Bill>();

  billForm!: FormGroup;
  rooms: Room[] = [];
  roomOptions: RoomOption[] = [];
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private billService: BillService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllRooms();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.billForm = this.fb.group({
      roomId: ['', Validators.required],
      period: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      dueDate: [null],
      status: ['unpaid', Validators.required]
    });

    // Populate form if editing
    if (this.bill) {
      this.billForm.patchValue({
        roomId: this.bill.roomId,
        period: this.bill.period,
        totalAmount: this.bill.totalAmount,
        dueDate: this.bill.dueDate ? new Date(this.bill.dueDate) : null,
        status: this.bill.status
      });
    }
  }

  /**
   * Load all rooms with boarding house information
   * Fixed: Now properly displays room names with boarding house names
   */
  private loadAllRooms(): void {
    this.loading = true;
    this.roomService.getRooms(1, 200, { includeAll: true }).subscribe({
      next: (response) => {
        this.rooms = response.data;
        
        // Map rooms to dropdown options with boarding house name
        this.roomOptions = this.rooms.map((room) => {
          // ✅ Fixed: Now boarding house name is included from backend
          const boardingHouseName = room.boardingHouse?.name || room.boardingHouseName || 'N/A';
          return {
            label: `${room.name} - ${boardingHouseName}`,
            value: room.id,
            data: room
          };
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách phòng'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.billForm.value;

    const billData = {
      ...formValue,
      dueDate: formValue.dueDate ? formValue.dueDate.toISOString() : null
    };

    const request$ = this.bill
      ? this.billService.updateBill(this.bill.id, billData)
      : this.billService.createBill(billData);

    request$.subscribe({
      next: (savedBill) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: this.bill ? 'Cập nhật hóa đơn thành công' : 'Tạo hóa đơn thành công'
        });
        this.onSave.emit(savedBill);
        this.closeDialog();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving bill:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.error?.message || 'Không thể lưu hóa đơn'
        });
        this.submitting = false;
      }
    });
  }

  /**
   * Close dialog
   */
  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.billForm.reset();
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.billForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('min')) {
      return 'Giá trị phải lớn hơn hoặc bằng 0';
    }
    return '';
  }
}
