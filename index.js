

var donationsApp = angular.module('DonationsApp', ['ngSanitize']);

donationsApp.controller('DonationsController', ['$scope', '$sce', function($scope, $sce){

  $scope.showForm = true;
  $scope.homelandForm = true;
  $scope.internationalForm = false;
  $scope.showThankCard = !$scope.showForm;
  $scope.showThankImage = false;
  $scope.userId = '';
  $scope.isExistsUser = false;

  $scope.donationForm = {
    interval: 'monthly',
    tabAmount: '1000',
    differntAmount: null,
    name: '',
    email: ''
  }

  $scope.fastDonateForSelect = [
    {name: '200₽', value: '200'},
    {name: '500₽', value: '500'},
    {name: '1000₽', value: '1000'},
    {name: '2000₽', value: '2000'},
    {name: '5000₽', value: '5000'},
  ]

  this.$onInit = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const languageParam = urlParams.get('lang');
    if (languageParam === 'en') {
      $scope.homelandForm = false;
      $scope.internationalForm = true;
    }
  };

  function calculateFinalAmount() {
    $scope.donationForm.finalAmount = $scope.donationForm.differntAmount || $scope.donationForm.tabAmount;
  }
  calculateFinalAmount();

  $scope.donationModeChange = function(key) {
    if(key === 'tabAmount') {
      $scope.donationForm.differntAmount = null;
      calculateFinalAmount();
    } else if(key === 'differntAmount') {
      if(!$scope.donationForm.differntAmount) {
        $scope.donationForm.tabAmount = '1000';
      } else {
        $scope.donationForm.tabAmount = null;
      }
      calculateFinalAmount();
    }
    $scope.validateForm();
  }

  $scope.validateForm = function() {
    $scope.isDonationFormValid = !!($scope.donationForm.name && $scope.donationForm.email);
    return $scope.isDonationFormValid;
  }

  $scope.donate = function() {
    $scope.getContact();

    let data = {};
    if('monthly' === $scope.donationForm.interval) {
      data.cloudPayments = {
        recurrent: {
          interval: 'Month',
          period: 1,
        }
      };
    }

    var widget = new cp.CloudPayments();
    widget.charge({ //options
        language: "ru-RU",
        publicId: 'pk_23c78d46b87ebe279b1a3ca60db46',
        description: 'Оплата на nasiliu.net. Благодарим вас за поддержку!', //назначение
        amount: parseInt($scope.donationForm.finalAmount),
        requireEmail: !0,
        email: $scope.donationForm.email,
        currency: 'RUB', //валюта
        invoiceId: Math.round(1e7 * Math.random()), //номер заказа  (необязательно)
        accountId: $scope.donationForm.email, //идентификатор плательщика (необязательно)
        // skin: "mini", //дизайн виджета (необязательно)
        data: data,
        phone: '',
      },
      function (options) { // success
        //action upon successful payment
        $scope.showDonateThankMessage();
        $scope.$apply();
        $scope.findActiveUser('WON');

        $scope.sendEmail();
      },
      function (reason, options) { // fail
        //action upon unsuccessful payment
        $scope.findActiveUser('NEW', reason);
        $scope.updateUserContact(reason);
        console.log(reason);
      }
    );
    //$scope.createUserContact();
  }

  $scope.findActiveUser = (stage, reason) => {
    wp.apiRequest({
      method: 'post',
      path: 'myplugin/v1/find',
      data: {
        AccountId: $scope.donationForm.email
      },
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        $scope.checkDataByUser(data, stage, reason);
      },
      error: function (data) {
        // console.log(data);
      }
    });
  }

  $scope.updateUserContact = (reason) => {
    // if($scope.userId === '') {
    //     $scope.createUserContact();
    //     return;
    // }
    let a = (reason === 'User has cancelled')
    console.log(a, reason, 'User has cancelled', $scope.userId)
    setTimeout(function(){
      wp.apiRequest({
        method: 'post',
        path: 'myplugin/v2/bitrix_update_contact',
        data: {
          Name: $scope.donationForm.name,
          Email: $scope.donationForm.email,
          CancelForm: (reason === 'User has cancelled'),
          ID: $scope.userId
        },
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        dataType: 'json',
        success: (data) => { },
        error: (data) => { }
      });
    }, 3000);
  }

  $scope.createUserContact = () => {
    wp.apiRequest({
      method: 'post',
      path: 'myplugin/v2/bitrix_contact',
      data: {
        Name: $scope.donationForm.name,
        Email: $scope.donationForm.email,
        ID: $scope.userId //(typeof($scope.userId) !== null) ? $scope.userId : ''
      },
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        console.log('id', $scope.userId);
        $scope.updateUserContact();
      },
      error: (data) => {
        console.log($scope.userId);
        // this
        //$scope.getContact();
      }
    });
  }

  $scope.checkDataByUser = (data, stageId, reason) => {
    let isRecurrent = $scope.donationForm.interval === 'monthly';
    let userData = {
      AccountInfo: $scope.donationForm.email,
      AccountId: data.Model.length ? data.Model[data.Model.length - 1].Id :
        (!!reason.length ? (isRecurrent ? 'Не удалось оформить подписку' : 'Не удалось совершить разовый платеж'): 'Успешный разовый платеж'),
      StageId: isRecurrent ? `C2:${stageId}`: `${stageId}`,
      ContactId: $scope.userId,
      Amount: parseInt($scope.donationForm.finalAmount),
      Name: $scope.donationForm.name,
      CategoryId: isRecurrent ? 2 : 0,
      Comment: reason ? reason: '',
    };

    $scope.sendDataToBitrix(userData);
  }

  $scope.getContact = () => {
    wp.apiRequest({
      method: 'post',
      path: 'myplugin/v2/bitrix_get_contacts',
      data: {
        Email: $scope.donationForm.email
      },
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        $scope.userId = data;
        console.log('contact exist');
        $scope.updateUserContact();
      },
      error: (data) => {
        $scope.userId = '';
        console.log(data, 'unsuccessful payment');
        $scope.createUserContact();
      }
    });
  }

  $scope.sendDataToBitrix = (userData) => {
    wp.apiRequest({
      method: 'post',
      path: 'myplugin/v2/bitrix',
      data: userData,
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      dataType: 'json',
      success: (data) => { },
      error: (data) => { }
    });
  }

  $scope.sendEmail = function () {
    wp.apiRequest({
      method: 'post',
      path: 'nasiliu-net/send-thanks-pics',
      data: JSON.stringify({
        email: $scope.donationForm.email,
        name: $scope.donationForm.name,
        interval: $scope.donationForm.interval
      }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {

      },
      error: function (data) {

      }
    });
  }

  $scope.showDonateThankMessage = function() {
    var amount = parseInt($scope.donationForm.finalAmount);
    $scope.finalAmountFormatted = formatNumber(amount);

    if(amount < 50000) {
      var message = getMessgae({
        amount: amount,
        amountFormat: $scope.finalAmountFormatted,
      });

      $scope.thankMessageText = $sce.trustAsHtml(message.text);
      $scope.thankMessageImageUrl = message.image;
    }

    $scope.showForm = false;
    $scope.showThankCard = true;
    $scope.showThankImage = amount > 99 && amount < 50000;
    // const script = document.createElement('script')
    // script.src = 'https://yastatic.net/share2/share.js';
    // document.head.append(script);

    Ya.share2('d_thank__share', {
      content: {
        url: 'https://nasiliu.net/podderzhat/',
        title: 'Помочь Центру "Насилию.нет"',
        image: 'https://nasiliu.net/opengraph/Logo_png.png',
      },
      theme: {
        services: 'twitter,facebook,vkontakte,telegram,odnoklassniki',
        lang: 'ru',
        limit: 5,
        size: 'm',
        bare: false
      },
      contentByService: {
        twitter: {
          image: 'https://nasiliu.net/opengraph/Logo_png_twitter1.png',
          title: 'Помочь Центру "Насилию.нет". Я перечислил(а) пожертвование для Центра «Насилию.нет» и буду рад(а), если вы тоже поддержите их работу.'
        },
        facebook: {
          title: 'Помочь Центру "Насилию.нет"'
        },
        vkontakte: {
          title: 'Помочь Центру "Насилию.нет"',
          image: 'https://nasiliu.net/opengraph/Logo_png_vk.png'
        },
        telegram: {
          title: 'Мне важно поддерживать организацию, которая помогает пострадавшим от домашнего насилия. Я перечислил(а) пожертвование для Центра «Насилию.нет» и буду рад(а), если вы тоже поддержите их работу. Только вместе мы создадим общество, в котором нет места насилию.'
        },
        odnoklassniki: {
          title: 'Помочь Центру "Насилию.нет"',
          description: 'Я перечислил(а) пожертвование для Центра «Насилию.нет» и буду рад(а), если вы тоже поддержите их работу.'
        }
      }
    });

  }

  function getDaysCase(number) {
    switch(number){
      case 1:
        return 'день';
      case 2:
      case 3:
      case 4:
        return 'дня';
      default:
        return 'дней';
    }
  }

  function getMessgae (options) {

    $scope.messages = [
      //Сумма от 1-99 рублей
      {
        minDonation: 1,
        maxDonateSum: 99,
        type: 'once',
        text: `<div>Вы пожертвовали <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Мы рады, что вы решили поддержать работу Центра. Ваше пожертвование — это вклад в систему поддержки пострадавших от домашнего насилия.</div>`,
        image: ''
      },
      {
        minDonation: 1,
        maxDonateSum: 99,
        type: 'monthly',
        text: `<div>Вы подписались на регулярное пожертвование на <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Ваша ежемесячная поддержка много значит для продолжения работы Центра. Именно благодаря пожертвованиям мы можем проводить психологические и юридические консультации и рассказывать большему количеству людей о проблеме насилия.</div>`,
        image: ''
      },
      //Сумма от 100-799 рублей
      {
        minDonation: 100,
        maxDonateSum: 799,
        type: 'once',
        text: `<div>Вы пожертвовали <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить ${Math.floor(options.amount/100)} ${getDaysCase(Math.floor(options.amount/100))} работы телефонной связи для того, чтобы отвечать на звонки от пострадавших и записывать их на консультации.</div>`,
        image: window.donationAppVars.imagesUrl + '100.png'
      },
      {
        minDonation: 100,
        maxDonateSum: 799,
        type: 'monthly',
        text: `<div>Вы подписались на регулярное пожертвование на <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем ежемесячно оплачивать ${Math.floor(options.amount/100)} ${getDaysCase(Math.floor(options.amount/100))} работы телефонной связи для того, чтобы отвечать на звонки от пострадавших и записывать их на консультации. Ваша регулярная поддержка поможет Центру проводить психологические и юридические консультации и рассказывать большему количеству людей о проблеме насилия.</div>`,
        image: window.donationAppVars.imagesUrl + '100.png'
      },
      //Сумма от 800-899 рублей
      {
        minDonation: 800,
        maxDonateSum: 899,
        type: 'once',
        text: `<div>Вы пожертвовали <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить 1 юридическую консультацию для пострадавшей от насилия, которой помогут найти решение в трудной жизненной ситуации и начать новую жизнь в безопасности.</div>`,
        image: window.donationAppVars.imagesUrl + '800.png'
      },
      {
        minDonation: 800,
        maxDonateSum: 899,
        type: 'monthly',
        text: `<div>Вы подписались на регулярное пожертвование на <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем раз в месяц оплачивать 1 юридическую консультацию для пострадавшей от насилия, которой помогут найти решение в трудной жизненной ситуации и начать новую жизнь в безопасности. Ваша регулярная поддержка поможет Центру проводить консультации и рассказывать большему количеству людей о проблеме насилия.</div>`,
        image: window.donationAppVars.imagesUrl + '800.png'
      },
      //Сумма от 900-1499 рублей
      {
        minDonation: 900,
        maxDonateSum: 1499,
        type: 'once',
        text: `<div>Вы пожертвовали <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить 1 юридическую консультацию для пострадавшей от насилия, которой помогут найти решение в трудной жизненной ситуации и начать новую жизнь в безопасности. Остальная часть суммы будет направлена на работу администратора, которая записывает пострадавших на консультации.</div>`,
        image: window.donationAppVars.imagesUrl + '800.png'
      },
      {
        minDonation: 900,
        maxDonateSum: 1499,
        type: 'monthly',
        text: `<div>Вы подписались на регулярное пожертвование на <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем раз в месяц оплачивать 1 юридическую консультацию для пострадавшей от насилия, которой помогут найти решение в трудной жизненной ситуации и начать новую жизнь в безопасности. Остальная часть суммы будет направляться на работу сотрудников Центра, которые создают новые проекты и освещают тему насилия в обществе.</div>`,
        image: window.donationAppVars.imagesUrl + '800.png'
      },
      //Сумма от 1500-4999 рублей
      {
        minDonation: 1500,
        maxDonateSum: 4999,
        type: 'once',
        text: `<div>Вы пожертвовали <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить ${Math.floor(options.amount/1500)} ${Math.floor(options.amount/1500) > 1 ? 'психологические консультации' : 'психологическую консультацию'}. Квалифицированные специалисты помогут пострадавшей/пострадавшему поверить в себя и найти силы для того, чтобы выйти из ситуации насилия. ${options.amount % 1500 > 500 ? 'Остальная часть суммы будет направлена на работу администратора, которая записывает пострадавших на консультации.' : '' }</div>`,
        image: window.donationAppVars.imagesUrl + '1500.png'
      },
      {
        minDonation: 1500,
        maxDonateSum: 4999,
        type: 'monthly',
        text: `<div>Вы подписались на регулярное пожертвование на <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить ${Math.floor(options.amount/1500)} ${Math.floor(options.amount/1500) > 1 ? 'психологические консультации' : 'психологическую консультацию'}. Квалифицированные специалисты помогут пострадавшей/пострадавшему поверить в себя и найти силы для того, чтобы выйти из ситуации насилия. ${options.amount % 1500 > 500 ? 'Остальная часть суммы будет направлена на работу администратора, которая записывает пострадавших на консультации.' : '' }</div>`,
        image: window.donationAppVars.imagesUrl + '1500.png'
      },
      //Сумма от 5000-49999 рублей
      {
        minDonation: 5000,
        maxDonateSum: 49999,
        type: 'once',
        text: `<div>Вы пожертвовали <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить ${Math.floor(options.amount/5000)} ${getDaysCase(Math.floor(options.amount/5000))} аренды офиса «Насилию.нет». Ваше пожертвование поможет пострадавшим от насилия обрести безопасное место, в котором они смогут получить консультации и найти поддержку у специалистов и сотрудников Центра. ${options.amount % 5000 > 1000 ? 'Остальная часть суммы будет направлена на работу сотрудников Центра, которые создают новые проекты и освещают тему насилия в обществе.' : '' }</div>`,
        image: window.donationAppVars.imagesUrl + '5000.png'
      },
      {
        minDonation: 5000,
        maxDonateSum: 49999,
        type: 'monthly',
        text: `<div>Вы подписались на регулярное пожертвование на <span class="d-sum-no-wrap">${options.amountFormat}₽</span>. Благодаря вашей поддержке мы сможем оплатить ${Math.floor(options.amount/5000)} ${getDaysCase(Math.floor(options.amount/5000))} аренды офиса «Насилию.нет». Ваше пожертвование поможет пострадавшим от насилия обрести безопасное место, в котором они смогут получить консультации и найти поддержку у специалистов и сотрудников Центра. ${options.amount % 5000 > 1000 ? 'Остальная часть суммы будет направлена на работу сотрудников Центра, которые создают новые проекты и освещают тему насилия в обществе.' : '' }</div>`,
        image: window.donationAppVars.imagesUrl + '5000.png'
      }
    ]


    var message = $scope.messages.find(m => m.type === $scope.donationForm.interval && options.amount >= m.minDonation && options.amount <= m.maxDonateSum);
    return message;
  }

  var formatNumber = function(input, fractionSeparator, thousandsSeparator, fractionSize) {
    fractionSeparator = fractionSeparator || ',';
    thousandsSeparator = thousandsSeparator || ' ';
    fractionSize = fractionSize || 3;
    var output = '',
      parts = [];

    input = input.toString();
    parts = input.split(".");

    parts[0] = parts[0].split('').reverse().join('');
    parts[0] = parts[0].replace(/(\d{3})/g, "$1" + thousandsSeparator).trim();
    output = parts[0].split('').reverse().join('');

    if (parts.length > 1) {
      output += fractionSeparator;
      output += parts[1].substring(0, fractionSize);
    }
    return output;
  };




}]);

jQuery(document).ready( function ($) {

  var owlHomeparse = $('.d-reviews__slider');
  owlHomeparse.owlCarousel({
    items: 1,
    loop: true,
    nav: false,
    dots: true,
    margin: 24,
    onDragged: onOwlSlideChange
  });

  function onOwlSlideChange(event) {
    $('.owl-item.active .d-reviews__slider__item').niceScroll();
  }
  $('.owl-item.active .d-reviews__slider__item').niceScroll();


});
