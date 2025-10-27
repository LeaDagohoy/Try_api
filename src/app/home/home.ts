import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Weather } from '../services/weather';

@Component({
  selector: 'app-home',
  imports: [CommonModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  city: string = '';
  weatherData: any = null;
  errorMessage: string = '';

  searchHistory: any[] = [];
  tasks: any[] = [];

  newTask: string = '';

  showToast: boolean = false;
  toastMessage: string = '';

  constructor(private weatherService: Weather) {}

  // 🌦 Get weather info
  getWeather() {
    this.weatherData = null;
    this.errorMessage = '';

    this.weatherService.getWeather(this.city).subscribe({
      next: (data) => {
        if (data.success === false || data.error) {
          this.errorMessage = 'City not found or API Error';
          this.weatherData = null;
          return;
        }

        this.weatherData = data;

        const now = new Date();
        this.searchHistory.unshift({
          city: this.city,
          date: now.toLocaleString()
        });

        // 🗑 Remove previous auto reminders
        this.tasks = this.tasks.filter((t) => !t.isAutoReminder);

        // 🌤 Add new weather reminder
        const condition = data.current.weather_descriptions[0];
        this.addWeatherReminder(condition);
      },
      error: () => {
        this.errorMessage = 'Network or API Error';
      }
    });
  }

  // 🌤️ Add automatic weather-based reminder and toast
  addWeatherReminder(condition: string) {
    const lower = condition.toLowerCase();
    let reminder = '';

    if (lower.includes('rain')) {
      reminder = '🌧 Bring an umbrella!';
    } else if (lower.includes('sunny') || lower.includes('clear')) {
      reminder = '☀️ Wear sunglasses and stay hydrated!';
    } else if (lower.includes('cloud')) {
      reminder = '☁️ Cloudy skies — perfect for a walk!';
    } else if (lower.includes('snow')) {
      reminder = '❄️ Stay warm, it’s snowing!';
    } else if (lower.includes('fog')) {
      reminder = '🌫 Drive carefully, low visibility!';
    } else if (lower.includes('thunder') || lower.includes('storm')) {
      reminder = '⚡ Stay indoors, thunderstorm ahead!';
    } else {
      reminder = '🌤 Have a great day!';
    }

    // Create a new reminder task
    const now = new Date();
    this.tasks.unshift({
      task: reminder,
      completed: false,
      createdAt: now.toLocaleString(),
      editedAt: null,
      completedAt: null,
      isAutoReminder: true
    });

    // 🎉 Show toast instead of alert
    this.showToastMessage(reminder);
  }

  // 🧾 Toast system
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;

    // Hide automatically after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // 📝 Add manual task
  addTask() {
    if (this.newTask.trim() === '') return;

    this.tasks.unshift({
      task: this.newTask,
      completed: false,
      createdAt: new Date().toLocaleString(),
      editedAt: null,
      completedAt: null,
      isAutoReminder: false
    });

    this.newTask = '';
  }

  // ✏️ Edit task
  editTask(task: any) {
    const newTaskName = prompt('Edit your task:', task.task);
    if (newTaskName !== null && newTaskName.trim() !== '') {
      task.task = newTaskName;
      task.editedAt = new Date().toLocaleString();
    }
  }

  // ✅ Complete task
  completeTask(task: any) {
    task.completed = true;
    task.completedAt = new Date().toLocaleString();
  }

  // 🗑 Delete task
  deleteTask(index: number) {
    this.tasks.splice(index, 1);
  }
}