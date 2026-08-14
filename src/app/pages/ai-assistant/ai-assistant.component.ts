import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  time: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent implements AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  
  messages = signal<ChatMessage[]>([
    { text: 'أهلاً بك يا باشمهندس! أنا المساعد الذكي لنظام ArchFirm. كيف يمكنني مساعدتك اليوم في إدارة مشاريعك أو تحليل البيانات؟', sender: 'ai', time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  
  userInput = signal('');
  isTyping = signal(false);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (!this.userInput().trim()) return;

    const userText = this.userInput();
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    this.messages.update(msgs => [...msgs, { text: userText, sender: 'user', time }]);
    this.userInput.set('');
    this.isTyping.set(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = 'عذراً، لم أفهم سؤالك بدقة. هل يمكنك التوضيح؟';
      
      if (userText.includes('مشاريع') || userText.includes('مشروع')) {
        aiResponse = 'لدينا حالياً 2 مشاريع نشطة. هل تريد مني عرض تفاصيل مشروع "فيلا التجمع الخامس" أو "مقر إداري العاصمة"؟';
      } else if (userText.includes('مهام') || userText.includes('تاسك')) {
        aiResponse = 'هناك 4 مهام مسجلة اليوم، منها مهمة واحدة متأخرة وهي "معاينة فيلا التجمع". يرجى مراجعتها.';
      } else if (userText.includes('أرباح') || userText.includes('فلوس') || userText.includes('مالية')) {
        aiResponse = 'الإيرادات المتوقعة هذا الشهر تتجاوز 150,000 ج.م بفضل تعاقدات العاصمة الإدارية الجديدة.';
      } else if (userText.includes('عملاء') || userText.includes('عميل')) {
        aiResponse = 'آخر عميل تمت إضافته للنظام هو "شركة الأفق". هل ترغب في إرسال بريد ترحيبي لهم؟';
      }

      this.messages.update(msgs => [...msgs, { text: aiResponse, sender: 'ai', time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }]);
      this.isTyping.set(false);
    }, 1500);
  }
}
