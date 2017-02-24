angular.module( 'todolistApp', [] );

//directive for one item ( with editable state and actions of edit )
angular.module( 'todolistApp' ).directive( 'item', function () {
  return {
    templateUrl   : "item.html",
    scope         : {
      items   : "=",
      data    : "=",
      author  : "=",
      form    : "="
    },
    controller    : function ( $scope ) {
      $scope.edit = false;
      $scope.empty = {
        title       : "",
        author      : "",
        createdAt   : "",
        description : ""
      };
      $scope.copy = $scope.empty;
      if ( $scope.form ) {
        $scope.data = angular.copy( $scope.empty );
      }
      //edit actions
      $scope.startEdit = function () {
        $scope.copy = angular.copy( $scope.data );
        $scope.edit = true;
      };
      $scope.cancelEdit = function () {
        $scope.data = angular.copy( $scope.copy );
        $scope.edit = false;
      } ;
      $scope.saveEdit = function () {
        io.socket.post( '/item/' + $scope.data.id, {
          title       : $scope.data.title,
          description : $scope.data.description
        }, function ( resData, jwres ) {
          if ( jwres.statusCode !== 200 ) {
            $scope.$apply( function () {
              $scope.data = angular.copy( $scope.copy );
              $scope.edit = false;
            } );
            return alert( "Error!" );
          }
          $scope.$apply( function () {
            $scope.edit = false;
          } );
        } );
      };
      $scope.delete = function () {
        if ( confirm( 'Are you sure?' ) ) {
          io.socket.delete( '/item/' + $scope.data.id, function ( resData, jwres ) {
            if ( jwres.statusCode !== 200 )
              return alert( "Error!" );
            $scope.$apply( function () {
              delete $scope.items[ $scope.data.id ];
              delete $scope.data;
            } );
          } );
        }
      };
      //create actions
      $scope.save = function () {
        io.socket.post( '/item', {
          title       : $scope.data.title,
          author      : $scope.author,
          description : $scope.data.description
        }, function ( resData, jwres ) {
          if ( jwres.statusCode !== 201 )
            return alert( "Error!" );
          $scope.$apply( function () {
            $scope.items[ resData.id ] = resData;
            $scope.data = angular.copy( $scope.empty );
          } );
        } );
      } ;
      $scope.cancel = function () {
        $scope.data = angular.copy( $scope.empty );
      }
    }
  }
} );
angular.module( 'todolistApp' ).controller( 'todolistController', function ( $scope, $filter ) {
  $scope.name = '';
  $scope.named = false;
  $scope.items = {};
  $scope.order = 'title';
  $scope.reverse = false;
  $scope.pressEnter = function ( $event ) {
    if ( $scope.name && $event.keyCode == 13 ) {
      $scope.named = true;
    }
  };
  $scope.itemsToArray = function ( ) {
    var retval = [];
    angular.forEach( $scope.items, function ( val ) {
      retval.push( val );
    } );
    return retval;
  } ;
  io.socket.get( '/item', function ( resData, jwres ) {
    if ( jwres.statusCode !== 200 )
      return alert( "Error!" );
    $scope.$apply( function () {
      resData.forEach( function ( val ) { $scope.items[ val.id ] = val; } );
    } );
    io.socket.on( "item", function( event ){
      console.log( event );
      if ( event.verb == 'created' ) {
        console.log( 1 );
        $scope.$apply( function () {
          $scope.items[ event.id ] = event.data;
        } );
      }
      else if ( event.verb == 'updated' ) {
        $scope.$apply( function () {
          $scope.items[ event.id ] ? angular.extend( $scope.items[ event.id ], event.data ) : alert( "Error!" );
        } );
      }
      else if ( event.verb == 'destroyed' ) {
        $scope.$apply( function () {
          delete $scope.items[ event.id ]
        } );
      }
    } );
  } );
} );
