class Quiz {
	constructor(data = testData, settings, i18n) {
		this.data = data;
		this.currentQuestion = 0;
		this.settings = {
			...{
				container: 'quiz-container',
				length: this.data.length > 10 ? 10 : this.data.length,
				shuffle: false,
				tryAgain: true
			},
			...settings
		};
		this.i18n = {
			...{ nextBtn: 'Next', endBtn: 'End' },
			...i18n
		};
		this.score = 0;
		this.totalScore = this.settings.length;
		this.init();
	}
	shuffle(data) {
		for (let i = data.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[data[i], data[j]] = [data[j], data[i]];
		}
		return data;
	}
	init() {
		// Shuffle answers
		for (let i = 0; i < this.data.length; i++)
			this.data.answers = this.shuffle(this.data[i].answers);
		// Shuffle data if needed
		this.data =
			this.settings.shuffle === true ? this.shuffle(this.data) : this.data;

		this.clearContainer();
		this.showCard(this.data[this.currentQuestion]);
	}
	clearContainer() {
		this.currentQuestion = 0;
		document.getElementById(this.settings.container).innerHTML = '';
	}
	endGame() {
		this.clearContainer();
		const parent = document.getElementById(this.settings.container);
		const resultPercent = this.score / this.totalScore;
		const img = document.createElement('img');
		img.width = 300;
		img.style.marginBottom = '1rem';
		if (resultPercent >= 0.86) {
			img.src =
				'https://s.tcdn.co/5ae/b11/5aeb11b7-d726-3f03-a206-9a6dc056d479/3.png';
			img.alt = 'Да ты красава!';
		} else if (resultPercent >= 0.71 && resultPercent < 0.86) {
			img.src =
				'https://s.tcdn.co/5ae/b11/5aeb11b7-d726-3f03-a206-9a6dc056d479/18.png';
			img.alt = 'Неплохо!';
		} else {
			img.src =
				'https://s.tcdn.co/5ae/b11/5aeb11b7-d726-3f03-a206-9a6dc056d479/8.png';
			img.alt = 'Повезет в другой раз!';
		}

		const h2 = document.createElement('h2');
		h2.innerHTML = `${this.score} из ${this.totalScore}`;
		h2.style.marginBottom = '1rem';

		const vkShareBtn = document.createElement('span');
		vkShareBtn.id = 'vkShareBtn';
		vkShareBtn.innerHTML = VK.Share.button(
			{
				url: 'https://joeberetta.github.io/spk_quiz/index.html',
				title: 'Онлайн-квиз от СПК',
				image: `http://via.placeholder.com/2000x400/fff/000.jpg?text=%D0%9C%D0%BE%D0%B9+%D1%80%D0%B5%D0%B7%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%82%3A+${this.score}+%D0%B8%D0%B7+${this.totalScore}`,
				noparse: true
			},
			{
				type: 'round',
				text: 'Поделиться результатом'
			}
		);

		parent.appendChild(h2);
		parent.appendChild(img);
		// Try again button (optional)
		if (this.settings.tryAgain) {
			const tryAgainBtn = document.createElement('button');
			tryAgainBtn.innerHTML = 'Попробовать снова';
			tryAgainBtn.style.marginBottom = '1rem';
			tryAgainBtn.onclick = () => this.init();
			parent.appendChild(tryAgainBtn);
		}
		parent.appendChild(vkShareBtn);
		this.score = 0;
	}
	generateAnswers(question, container) {
		container.innerHTML = '';

		function passAnswer(input) {
			if (input.checked) {
				input.parentElement.classList.add('checked');
			} else {
				input.parentElement.classList.remove('checked');
			}
			if (input.type === 'radio' && input.checked) {
				this.score += Number(input.value);
				if (this.currentQuestion < this.settings.length - 1)
					this.showCard(this.data[(this.currentQuestion += 1)]);
				else this.endGame();
			} else {
				const btn = document.createElement('button');
				btn.innerHTML =
					this.currentQuestion === this.settings.length - 1
						? this.i18n.endBtn
						: this.i18n.nextBtn;
				btn.onclick = () => {
					const multiScore = [...container.querySelectorAll('input:checked')]
						.map(inp => Number(inp.value))
						.reduce((a, c) => a + c);
					this.score += multiScore;
					this.currentQuestion === this.settings.length - 1
						? this.endGame()
						: this.showCard(this.data[(this.currentQuestion += 1)]);
				};
				if (!container.querySelector('button')) container.appendChild(btn);
			}
		}
		passAnswer = passAnswer.bind(this);

		const answers = question.answers;
		const multipleChoice =
			answers.filter(answer => answer.score > 0).length > 1;

		for (let i = 0; i < answers.length; i++) {
			const answerForm = document.createElement('input');
			answerForm.type = multipleChoice ? 'checkbox' : 'radio';
			answerForm.name = 'answer';
			answerForm.value = answers[i].score;
			answerForm.onclick = () => setTimeout(() => passAnswer(answerForm), 150);
			const answerLabel = document.createElement('label');
			answerLabel.innerHTML = answers[i].answer;
			answerLabel.appendChild(answerForm);
			container.appendChild(answerLabel);
		}
	}
	showCard(question) {
		const parent = document.getElementById(this.settings.container);
		const isChildNotExist = parent.querySelector('#quiz-card') === null;

		const child = isChildNotExist
			? document.createElement('div')
			: document.querySelector('#quiz-card');

		const pageFromTotal = isChildNotExist
			? document.createElement('p')
			: child.querySelector('p');
		pageFromTotal.style.textAlign = 'center';
		pageFromTotal.style.marginBottom = '1rem';
		pageFromTotal.innerHTML = `${this.currentQuestion + 1}/${
			this.settings.length
		}`;

		const questionText = isChildNotExist
			? document.createElement('h3')
			: child.querySelector('h3');
		questionText.innerHTML = question.question;

		const answersContainer = isChildNotExist
			? document.createElement('div')
			: child.querySelector('div');

		this.generateAnswers(this.data[this.currentQuestion], answersContainer);

		if (isChildNotExist) {
			child.id = 'quiz-card';
			child.appendChild(pageFromTotal);
			child.appendChild(questionText);
			child.appendChild(answersContainer);
			parent.appendChild(child);
		}
	}
}
